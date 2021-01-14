import datetime

from flask import Response, stream_with_context
from mistral.exceptions import AccessToDatasetDenied, WrongDbConfiguration
from mistral.services.arkimet import BeArkimet as arki
from mistral.services.dballe import BeDballe as dballe
from mistral.services.sqlapi_db_manager import SqlApiDbManager
from restapi import decorators
from restapi.connectors import sqlalchemy
from restapi.exceptions import BadRequest, Conflict, NotFound, ServerError, Unauthorized
from restapi.models import Schema, fields, validate
from restapi.rest.definition import EndpointResource
from restapi.utilities.logs import log

FILEFORMATS = ["BUFR", "JSON"]


class ObservationsQuery(Schema):
    networks = fields.Str(required=False)
    q = fields.Str(required=False)
    interval = fields.Int(required=False)
    lonmin = fields.Float(required=False)
    latmin = fields.Float(required=False)
    lonmax = fields.Float(required=False)
    latmax = fields.Float(required=False)
    lat = fields.Float(required=False)
    lon = fields.Float(required=False)
    ident = fields.Str(required=False)
    onlyStations = fields.Bool(required=False)
    stationDetails = fields.Bool(required=False)
    reliabilityCheck = fields.Bool(required=False)


class ObservationsDownloader(Schema):
    output_format = fields.Str(validate=validate.OneOf(FILEFORMATS), required=True)
    networks = fields.Str(required=False)
    q = fields.Str(required=True)
    lonmin = fields.Float(required=False)
    latmin = fields.Float(required=False)
    lonmax = fields.Float(required=False)
    latmax = fields.Float(required=False)
    lat = fields.Float(required=False)
    lon = fields.Float(required=False)
    ident = fields.Str(required=False)
    singleStation = fields.Bool(required=False)
    reliabilityCheck = fields.Bool(required=False)


class MapsObservations(EndpointResource):
    # schema_expose = True
    labels = ["maps-observations"]

    @decorators.auth.optional()
    @decorators.use_kwargs(ObservationsQuery, location="query")
    @decorators.endpoint(
        path="/observations",
        summary="Get values of observed parameters",
        responses={
            200: "List of values successfully retrieved",
            400: "Missing params",
            404: "The query does not give result",
            409: "The requested interval is greater than the requested timerange",
        },
    )
    @decorators.cache(timeout=600)
    # 200: {'schema': {'$ref': '#/definitions/MapStations'}}
    def get(
        self,
        q="",
        networks=None,
        interval=None,
        lonmin=None,
        latmin=None,
        lonmax=None,
        latmax=None,
        lat=None,
        lon=None,
        ident=None,
        onlyStations=False,
        stationDetails=False,
        reliabilityCheck=False,
    ):
        user = self.get_user()
        alchemy_db = sqlalchemy.get_instance()
        query = {}
        if lonmin or latmin or lonmax or latmax:
            if not lonmin or not lonmax or not latmin or not latmax:
                raise BadRequest("Coordinates for bounding box are missing")
            else:
                # append bounding box params to the query
                query["lonmin"] = lonmin
                query["lonmax"] = lonmax
                query["latmin"] = latmin
                query["latmax"] = latmax

        if networks:
            # check user authorization for the requested network
            dataset_name = arki.from_network_to_dataset(networks)
            if not dataset_name:
                raise NotFound("The requested network does not exists")
            check_auth = SqlApiDbManager.check_dataset_authorization(
                alchemy_db, dataset_name, user
            )
            if not check_auth:
                raise Unauthorized(
                    "user is not authorized to access the selected network"
                )
            query["rep_memo"] = networks
        if reliabilityCheck:
            query["query"] = "attrs"

        # parse the query
        if q:
            parsed_query = dballe.from_query_to_dic(q)
            for key, value in parsed_query.items():
                query[key] = value

        # check consistency with license group
        dsn_subset = []
        if "license" not in query:
            if networks == "multim-forecast":
                # is the only case where the request come without a requested license group
                multim_group_license = SqlApiDbManager.get_license_group(
                    alchemy_db, [dataset_name]
                )
                query["license"] = multim_group_license.name
            else:
                raise BadRequest("License group parameter is mandatory")
        # 1. user is authorized to see data from that license group (is open or at least one of his authorized dataset comes from the group)
        group_license = alchemy_db.GroupLicense.query.filter_by(
            name=query["license"]
        ).first()
        if not group_license:
            raise BadRequest("The selected group of license does not exists")
        # check if the license group is open
        if not group_license.is_public:
            if not user:
                raise Unauthorized(
                    "to access not open datasets the user has to be logged"
                )
            else:
                auth_datasets = []
                auth_datasets_dic = SqlApiDbManager.get_datasets(
                    alchemy_db, user, category="OBS", group_license=query["license"]
                )
                for d in auth_datasets_dic:
                    auth_datasets.append(d["id"])
                if not auth_datasets:
                    raise Unauthorized(
                        "the user is not authorized to access datasets from the selected license group"
                    )
                # check if the user is authorized to all datasets in the DSN corresponding to the license group
                dsn_datasets = SqlApiDbManager.retrieve_dataset_by_dsn(
                    alchemy_db, group_license.dballe_dsn
                )
                log.debug(
                    "dsn datasets: {}, authorized datasets: {}",
                    dsn_datasets,
                    auth_datasets,
                )
                if set(auth_datasets) != set(dsn_datasets):
                    dsn_subset = [elem for elem in auth_datasets]
        # 2. if a network is requested check if belongs to the selected license group
        if networks:
            ds_group_license = SqlApiDbManager.get_license_group(
                alchemy_db, [dataset_name]
            )
            if ds_group_license.name != group_license.name:
                raise BadRequest(
                    "The selected network and the selected license group does not match"
                )

        # get db type
        if "datetimemin" in query:
            db_type = dballe.get_db_type(query["datetimemin"], query["datetimemax"])
            if db_type != "dballe" and not user:
                raise Unauthorized("to access archived data the user has to be logged")
        else:
            if not user:
                raise Unauthorized("to access archived data the user has to be logged")
            else:
                db_type = "mixed"

        log.debug("type of database: {}", db_type)

        if interval:
            # check if there is a requested timerange and if its interval is lower of the requested one
            if "timerange" in query:
                splitted_timerange = query["timerange"][0].split(",")
                timerange_interval = int(splitted_timerange[1]) / 3600
                if timerange_interval > interval:
                    raise Conflict(
                        "the requested interval is greater than the requested timerange"
                    )

        query_station_data = {}
        if stationDetails:
            # check params for station
            if not networks:
                raise BadRequest("Parameter networks is missing")
            if not ident:
                if not lat or not lon:
                    raise BadRequest("Parameters to get station details are missing")
                else:
                    query_station_data["lat"] = lat
                    query_station_data["lon"] = lon
            else:
                query_station_data["ident"] = ident

            query_station_data["rep_memo"] = networks

            # since timerange and level are mandatory, add to the query for meteograms
            if query:
                if "timerange" in query:
                    query_station_data["timerange"] = query["timerange"]
                if "level" in query:
                    query_station_data["level"] = query["level"]

            if reliabilityCheck:
                query_station_data["query"] = "attrs"
            if query and "datetimemin" in query:
                query_station_data["datetimemin"] = query["datetimemin"]
                query_station_data["datetimemax"] = query["datetimemax"]

        try:
            if db_type == "mixed":
                raw_res = dballe.get_maps_response_for_mixed(
                    query,
                    onlyStations,
                    query_station_data=query_station_data,
                    dsn_subset=dsn_subset,
                )
            else:
                raw_res = dballe.get_maps_response(
                    query,
                    onlyStations,
                    interval=interval,
                    db_type=db_type,
                    query_station_data=query_station_data,
                    dsn_subset=dsn_subset,
                )
        except AccessToDatasetDenied:
            raise ServerError("Access to dataset denied")
        except WrongDbConfiguration:
            raise ServerError(
                "no dballe DSN configured for the requested license group"
            )
        # parse the response
        res = dballe.parse_obs_maps_response(raw_res)

        if not res and stationDetails:
            raise NotFound("Station data not found")

        return self.response(res)

    @decorators.auth.optional()
    @decorators.use_kwargs(ObservationsDownloader, location="query")
    @decorators.endpoint(
        path="/observations",
        summary="Download the observed data displayed on the map",
        responses={
            200: "File of observed data",
            400: "Missing params",
            404: "The query does not give result",
        },
    )
    # 200: {'schema': {'$ref': '#/definitions/Fileoutput'}}
    def post(
        self,
        q,
        output_format,
        networks=None,
        lonmin=None,
        latmin=None,
        lonmax=None,
        latmax=None,
        lat=None,
        lon=None,
        ident=None,
        singleStation=False,
        reliabilityCheck=False,
    ):
        user = self.get_user()
        query_data = {}
        if lonmin or latmin or lonmax or latmax:
            if not lonmin or not lonmax or not latmin or not latmax:
                raise BadRequest("Coordinates for bounding box are missing")
            else:
                # append bounding box params to the query
                query_data["lonmin"] = lonmin
                query_data["lonmax"] = lonmax
                query_data["latmin"] = latmin
                query_data["latmax"] = latmax

        if networks:
            query_data["rep_memo"] = networks
        if reliabilityCheck:
            query_data["query"] = "attrs"

        if q:
            # parse the query
            parsed_query = dballe.from_query_to_dic(q)
            for key, value in parsed_query.items():
                query_data[key] = value

            # get db type
            if "datetimemin" in query_data:
                db_type = dballe.get_db_type(
                    query_data["datetimemin"], query_data["datetimemax"]
                )
                if db_type != "dballe" and not user:
                    raise Unauthorized(
                        "to access archived data the user has to be logged"
                    )
            else:
                if not user:
                    raise Unauthorized(
                        "to access archived data the user has to be logged"
                    )
                else:
                    db_type = "mixed"
        else:
            if not user:
                raise Unauthorized("to access archived data the user has to be logged")
            else:
                db_type = "mixed"
        log.debug("type of database: {}", db_type)

        query_station_data = {}
        if singleStation:
            # check params for station
            if not networks:
                raise BadRequest("Parameter networks is missing")
            if not ident:
                if not lat or not lon:
                    raise BadRequest("Parameters to get station details are missing")
                else:
                    query_station_data["lat"] = lat
                    query_station_data["lon"] = lon
            else:
                query_station_data["ident"] = ident

            query_station_data["rep_memo"] = networks

            # since timerange and level are mandatory, add to the query for meteograms
            if query_data:
                if "timerange" in query_data:
                    query_station_data["timerange"] = query_data["timerange"]
                if "level" in query_data:
                    query_station_data["level"] = query_data["level"]

            if reliabilityCheck:
                query_station_data["query"] = "attrs"
            if query_data and "datetimemin" in query_data:
                query_station_data["datetimemin"] = query_data["datetimemin"]
                query_station_data["datetimemax"] = query_data["datetimemax"]

        try:
            if db_type == "mixed":
                query_data_for_dballe = {}
                query_data_for_arki = {}
                query_station_data_for_dballe = {}
                query_station_data_for_arki = {}
                if query_station_data:
                    query_station_data_for_dballe = {**query_station_data}
                    query_station_data_for_arki = {**query_station_data}
                if query_data:
                    query_data_for_dballe = {**query_data}
                    query_data_for_arki = {**query_data}

                # get reftimes for arkimet and dballe
                dballe_reftime_in_query = {}
                arki_reftime_in_query = {}
                if query_data:
                    if "datetimemin" in query_data and "datetimemax" in query_data:
                        (
                            refmax_dballe,
                            refmin_dballe,
                            refmax_arki,
                            refmin_arki,
                        ) = dballe.split_reftimes(
                            query_data["datetimemin"], query_data["datetimemax"]
                        )
                        # set up queries with the correct reftimes
                        dballe_reftime_in_query["datetimemin"] = refmin_dballe
                        dballe_reftime_in_query["datetimemax"] = refmax_dballe
                        arki_reftime_in_query["datetimemin"] = refmin_arki
                        arki_reftime_in_query["datetimemax"] = refmax_arki

                if not dballe_reftime_in_query:
                    # if there is no reftime i'll get the data of the last hour
                    # TODO last hour or last day as default?
                    # for production
                    instant_now = datetime.datetime.now()
                    # for local tests
                    # today = date(2015, 12, 31)
                    # time_now = datetime.datetime.now().time()
                    # instant_now = datetime.datetime.combine(today, time_now)

                    dballe_reftime_in_query["datetimemax"] = instant_now
                    dballe_reftime_in_query["datetimemin"] = datetime.datetime.combine(
                        instant_now, datetime.time(instant_now.hour, 0, 0)
                    )

                # get queries and db for dballe extraction (taking advantage of the method already implemented to get data values for maps)
                log.debug("getting queries and db for dballe")
                for key, value in dballe_reftime_in_query.items():
                    query_data_for_dballe[key] = value
                    if query_station_data_for_dballe:
                        query_station_data_for_dballe[key] = value
                (
                    dballe_db,
                    dballe_query_data,
                    dballe_query_station_data,
                ) = dballe.get_maps_response(
                    query_data_for_dballe,
                    False,
                    db_type="dballe",
                    query_station_data=query_station_data_for_dballe,
                    download=True,
                )
                # get queries and db for arkimet extraction
                arki_db = None
                arki_query_data = {}
                arki_query_station_data = {}
                if arki_reftime_in_query:
                    for key, value in arki_reftime_in_query.items():
                        query_data_for_arki[key] = value
                        if query_station_data_for_arki:
                            query_station_data_for_arki[key] = value
                    log.debug("getting queries and db for arkimet")
                    (
                        arki_db,
                        arki_query_data,
                        arki_query_station_data,
                    ) = dballe.get_maps_response(
                        query_data_for_arki,
                        False,
                        db_type="arkimet",
                        query_station_data=query_station_data_for_arki,
                        download=True,
                    )

                # merge the queries and the db
                log.debug("merge queries and db for mixed extraction")
                (
                    db_for_extraction,
                    download_query_data,
                ) = dballe.merge_db_for_download(
                    dballe_db,
                    dballe_query_data,
                    arki_db,
                    arki_query_data,
                )
                # if there is a query station data, merge the two queries
                download_query_station_data = {}
                if query_station_data:
                    download_query_station_data = dballe.parse_query_for_maps(
                        dballe_query_station_data
                    )
                    if arki_query_station_data:
                        if "datetimemin" in arki_query_station_data:
                            download_query_station_data[
                                "datetimemin"
                            ] = arki_query_station_data["datetimemin"]
            else:
                # take advantage of the method already implemented to get data values for maps in order to get the query and the db to extract the data
                (
                    db_for_extraction,
                    download_query_data,
                    download_query_station_data,
                ) = dballe.get_maps_response(
                    query_data,
                    False,
                    db_type=db_type,
                    query_station_data=query_station_data,
                    download=True,
                )

            mime = None
            if output_format == "JSON":
                mime = "application/json"
            else:
                mime = "application/octet-stream"

            # stream data
            if db_for_extraction:
                return Response(
                    stream_with_context(
                        dballe.download_data_from_map(
                            db_for_extraction,
                            output_format,
                            download_query_data,
                            download_query_station_data,
                            qc_filter=reliabilityCheck,
                        )
                    ),
                    mimetype=mime,
                )
            else:
                return []
        except AccessToDatasetDenied:
            raise ServerError("Access to dataset denied")
