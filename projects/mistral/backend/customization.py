from restapi.connectors import sqlalchemy
from restapi.customizer import BaseCustomizer
from restapi.exceptions import NotFound
from restapi.models import AdvancedList, Schema, fields, validate
from restapi.utilities.logs import log


class GroupLicence(Schema):
    id = fields.Str()
    name = fields.Str()


class Datasets(Schema):
    id = fields.Str()
    name = fields.Str()


class Customizer(BaseCustomizer):
    @staticmethod
    def custom_user_properties_pre(properties):
        extra_properties = {}
        for p in ("datasets", "group_license"):
            if p in properties:
                extra_properties[p] = properties.pop(p, None)
        return properties, extra_properties

    @staticmethod
    def custom_user_properties_post(user, properties, extra_properties, db):

        licences = []
        for licence_id in extra_properties.get("group_license", []):
            lic = db.GroupLicense.query.filter_by(id=int(licence_id)).first()
            if not lic:
                raise NotFound(f"GroupLicense {licence_id} not found")

            licences.append(lic)
        user.group_license = licences

        datasets = []
        for dataset_id in extra_properties.get("datasets", []):
            dat = db.Datasets.query.filter_by(id=int(dataset_id)).first()
            if not dat:
                raise NotFound(f"Dataset {dataset_id} not found")

            datasets.append(dat)

        log.critical(datasets)
        user.datasets = datasets

    @staticmethod
    def manipulate_profile(ref, user, data):
        data["disk_quota"] = user.disk_quota
        data["amqp_queue"] = user.amqp_queue
        data["requests_expiration_days"] = user.requests_expiration_days
        data["datasets"] = user.datasets
        data["group_license"] = user.group_license

        return data

    @staticmethod
    def get_custom_input_fields(request, scope):

        # prevent queries at server startup
        if request:
            db = sqlalchemy.get_instance()
            datasets = db.Datasets.query.all()
            licences = db.GroupLicense.query.all()
        else:
            datasets = []
            licences = []

        required = request and request.method == "POST"

        if scope == BaseCustomizer.ADMIN:
            return {
                "disk_quota": fields.Int(
                    required=required,
                    # validate=validate.Range(min=0, max=???),
                    validate=validate.Range(min=0),
                    label="Disk quota",
                    description="Disk quota in bytes",
                ),
                "amqp_queue": fields.Str(
                    required=False,
                    label="AMQP queue",
                    description="AMQP queue used to notify the user",
                ),
                "requests_expiration_days": fields.Int(
                    required=False,
                    missing=0,
                    validate=validate.Range(min=0, max=365),
                    label="Requests expirations (in days, 0 to disable)",
                    description="Number of days after which requests will be cleaned",
                ),
                "group_license": AdvancedList(
                    fields.Str(
                        validate=validate.OneOf(
                            choices=[str(v.id) for v in licences],
                            labels=[v.name for v in licences],
                        )
                    ),
                    required=False,
                    label="Allowed licences",
                    description="",
                    unique=True,
                    multiple=True,
                ),
                "datasets": AdvancedList(
                    fields.Str(
                        validate=validate.OneOf(
                            choices=[str(v.id) for v in datasets],
                            labels=[v.name for v in datasets],
                        )
                    ),
                    required=False,
                    label="Allowed datasets",
                    description="",
                    unique=True,
                    multiple=True,
                ),
            }

        # these are editable fields in profile
        if scope == BaseCustomizer.PROFILE:
            return {
                "requests_expiration_days": fields.Int(
                    required=False,
                    missing=0,
                    validate=validate.Range(min=0, max=365),
                    label="Requests expirations (in days, 0 to disable)",
                    description="Number of days after which requests will be cleaned",
                )
            }

        # these are additional fields in registration form
        if scope == BaseCustomizer.REGISTRATION:
            return {}

    @staticmethod
    def get_custom_output_fields(request):
        custom_fields = Customizer.get_custom_input_fields(
            request, scope=BaseCustomizer.ADMIN
        )

        custom_fields["datasets"] = fields.Nested(Datasets(many=True))
        custom_fields["group_license"] = fields.Nested(GroupLicence(many=True))

        return custom_fields
