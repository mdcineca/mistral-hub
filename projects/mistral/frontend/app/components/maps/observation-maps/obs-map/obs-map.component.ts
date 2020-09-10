import {
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from "@angular/core";
import {
  ObsData,
  Observation,
  ObsFilter,
  ObsService,
  SingleObsData,
  Station,
} from "../services/obs.service";
import { ObsStationReportComponent } from "../obs-station-report/obs-station-report.component";
import { COLORS, obsData, VAR_TABLE } from "../services/data";
import { NotificationService } from "@rapydo/services/notification";
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

import * as L from "leaflet";
import "leaflet.markercluster";

@Component({
  selector: "app-obs-map",
  templateUrl: "./obs-map.component.html",
  styleUrls: ["./obs-map.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class ObsMapComponent {
  @Output() updateCount: EventEmitter<number> = new EventEmitter<number>();

  // base layer
  streetMaps = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      detectRetina: true,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://creativecommons.org/licenses/by-nd/4.0/legalcode">Work distributed under License CC BY-ND 4.0</a>',
    }
  );

  // Marker cluster stuff
  markerClusterGroup: L.MarkerClusterGroup;
  markerClusterData: L.Marker[] = [];
  markerClusterOptions: L.MarkerClusterGroupOptions;
  map: L.Map;
  legend = new L.Control({ position: "bottomright" });

  // Set the initial set of displayed layers
  options = {
    layers: [this.streetMaps],
    zoom: 5,
    center: [45.0, 12.0],
  };

  private filter: ObsFilter;

  constructor(
    private obsService: ObsService,
    private notify: NotificationService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal
  ) {
    // custom cluster options
    this.markerClusterOptions = {
      iconCreateFunction: function (cluster, srv = obsService) {
        const childCount = cluster.getChildCount();
        const childMarkers: L.Marker[] = cluster.getAllChildMarkers();
        let res: string = "" + childCount;
        let c = " marker-cluster-";
        let dirtyCluster = false;
        if (childCount < 10) {
          c += "small";
        } else if (childCount < 100) {
          c += "medium";
        } else {
          c += "large";
        }
        let type: string;
        if (childMarkers[0].options["data"]) {
          let mean = 0,
            medians: number[] = [],
            dirtyMedians: number[] = [];
          for (const m of childMarkers) {
            const singleObsData: SingleObsData = m.options["data"];
            if (!type) {
              type = singleObsData.varcode;
            }
            if (singleObsData.value.is_reliable) {
              let val = singleObsData.value.value;
              medians.push(val);
            } else {
              let dirtyVal = singleObsData.value.value;
              dirtyMedians.push(dirtyVal);
            }
          }
          //console.log(medians)
          // get the median instead of the mean
          // let val = mean/childCount;
          let val =
            medians.length > 0
              ? ObsService.median(medians)
              : ((dirtyCluster = true), ObsService.median(dirtyMedians));
          res = ObsService.showData(val, type, 3);

          // custom background color of cluster
          c = " mst-marker-color-" + srv.getColor(val, srv.min, srv.max);

          // if the cluster contains data for a single station, bind a tooltip
          let is_single_station = false;
          let station_lng = null;
          let station_lat = null;
          for (let i = 0; i < childMarkers.length; i++) {
            let latlng = childMarkers[i].getLatLng();
            if (!station_lng) {
              station_lat = latlng.lat;
              station_lng = latlng.lng;
              is_single_station = true;
            } else if (
              latlng.lat !== station_lat &&
              latlng.lng !== station_lng
            ) {
              is_single_station = false;
              break;
            }
          }
          if (is_single_station) {
            cluster.bindTooltip(
              ObsMapComponent.buildTooltipTemplate(
                childMarkers[0].options["station"]
              ),
              {
                direction: "top",
                offset: [3, -8],
              }
            );
          }
        }
        let warn = "";
        if (dirtyCluster) {
          warn =
            '<i class="fas fa-exclamation-triangle fa-lg dirty-cluster"></i>';
        }
        //console.log("marker ",marker)

        return new L.DivIcon({
          html: "<div>" + warn + "<span>" + res + "</span></div>",
          className: "marker-cluster" + c,
          iconSize: new L.Point(40, 40),
        });
      },
      spiderLegPolylineOptions: {
        weight: 1,
        color: "#222",
        opacity: 0.5,
        dashArray: "10 10",
      },
      spiderfyDistanceMultiplier: 1.2,
    };
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }

  markerClusterReady(group: L.MarkerClusterGroup) {
    this.markerClusterGroup = group;
  }

  updateMap(filter: ObsFilter) {
    this.filter = filter;
    // get data
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }
    setTimeout(() => this.spinner.show(), 0);
    this.obsService
      .getData(filter)
      .subscribe(
        (data: Observation[]) => {
          // console.log(data);
          this.updateCount.emit(data.length);
          this.loadMarkers(data, filter.product, filter.onlyStations);
          if (data.length === 0) {
            this.notify.showWarning(
              "No results found. Try applying a different filter."
            );
          }
        },
        (error) => {
          this.notify.showError(error);
        }
      )
      .add(() => {
        setTimeout(() => this.spinner.hide(), 0);
      });
  }

  fitBounds() {
    if (this.markerClusterData.length > 0) {
      this.map.fitBounds(this.markerClusterGroup.getBounds(), {
        padding: L.point(24, 24),
        maxZoom: 12,
        animate: true,
      });
    }
  }

  /**
   *
   * @param data
   */
  private loadMarkers(
    data: Observation[],
    product: string,
    onlyStations = false
  ) {
    const markers: L.Marker[] = [];
    let min: number, max: number;
    let obsData: ObsData;
    let singleObsData: SingleObsData;
    if (!onlyStations) {
      // min and max needed before data marker creation
      data.forEach((s) => {
        obsData = s.products.find((x) => x.varcode === product);
        let localMin = Math.min(
          ...obsData.values.filter((v) => v.is_reliable).map((v) => v.value)
        );
        if (!min || localMin < min) {
          min = localMin;
        }
        let localMax = Math.max(
          ...obsData.values.filter((v) => v.is_reliable).map((v) => v.value)
        );
        if (!max || localMax > max) {
          max = localMax;
        }
      });
    }
    data.forEach((s) => {
      let icon;
      if (!onlyStations) {
        obsData = s.products.find((x) => x.varcode === product);
        let single_observation = false;
        let count = obsData.values.length;
        if (count === 1) {
          single_observation = true;
        }
        for (let i = 0; i < obsData.values.length; i++) {
          // create an object for each value of obsData
          singleObsData = JSON.parse(JSON.stringify(obsData));
          delete singleObsData["values"];
          singleObsData.value = obsData.values[i];
          let val = singleObsData.value.value;
          icon = L.divIcon({
            html: `<div class="mstDataIcon"><span>${ObsService.showData(
              val,
              product
            )}</span></div>`,
            iconSize: [24, 6],
            className:
              "leaflet-marker-icon mst-marker-color-" +
              this.obsService.getColor(val, min, max),
          });
          const marker = new L.Marker([s.station.lat, s.station.lon], {
            icon: icon,
          });
          marker.options["station"] = s.station;
          if (s.products) {
            marker.options["data"] = singleObsData;
            marker.bindTooltip(
              !single_observation
                ? ObsMapComponent.buildDataTooltip(
                    singleObsData.value.reftime,
                    singleObsData.value.level_desc,
                    singleObsData.value.timerange_desc
                  )
                : ObsMapComponent.buildTooltipTemplate(
                    s.station,
                    singleObsData.value.reftime,
                    singleObsData.value.level_desc,
                    singleObsData.value.timerange_desc
                  ),
              {
                direction: "top",
                offset: [3, -8],
              }
            );
            // marker.bindPopup(
            //   '<p>Hello world!<br />This is a nice popup.</p>'
            // );
            marker.on("click", this.openStationReport.bind(this, s.station));
          }
          markers.push(marker);
        }
      } else {
        icon = L.divIcon({
          html: '<i class="fa fa-map-marker-alt fa-3x"></i>',
          iconSize: [20, 20],
          className: "mstDivIcon",
        });
        const marker = new L.Marker([s.station.lat, s.station.lon], {
          icon: icon,
        });
        marker.options["station"] = s.station;
        if (s.products) {
          marker.options["data"] = obsData;
        }

        marker.bindTooltip(ObsMapComponent.buildTooltipTemplate(s.station), {
          direction: "top",
          offset: [3, -8],
        });
        markers.push(marker);
      }
    });

    if (!onlyStations && data.length > 0) {
      console.log(`min ${min}, max ${max}`);
      this.obsService.min = min;
      this.obsService.max = max;
      this.buildLegend(product, min, max);
    } else {
      this.legend.remove();
    }

    this.markerClusterData = markers;
    this.markerClusterGroup.addLayers(markers);

    this.fitBounds();
  }

  private openStationReport(station: Station) {
    const modalRef = this.modalService.open(ObsStationReportComponent, {
      size: "xl",
      centered: true,
    });
    modalRef.componentInstance.station = station;
    modalRef.componentInstance.filter = this.filter;
    // need to trigger resize event
    window.dispatchEvent(new Event("resize"));
  }

  private static buildTooltipTemplate(
    station: Station,
    reftime?: string,
    level?: string,
    timerange?: string
  ) {
    let ident = station.ident || "";
    let station_name = station.details.find((x) => x.code === "B01019") || "";
    const template =
      `<ul class="p-1 m-0">` +
      `<li><b><u>Station</u></b></li>` +
      (typeof station_name === "object"
        ? `<li><b>Name</b>: ` + station_name.value + `</li>`
        : "") +
      `<li><b>Network</b>: ${station.network}</li>` +
      (ident !== "" ? `<li><b>Ident</b>: ` + ident + `</li>` : "") +
      `<li><b>Lat</b>: ${station.lat}</li>` +
      `<li><b>Lon</b>: ${station.lon}</li>` +
      (reftime
        ? `<br><li><b><u>Data</u></b></li><li><b>Reftime</b>: ` +
          reftime +
          `</li>`
        : "") +
      (level ? `<li><b>Level</b>: ` + level + `</li>` : "") +
      (timerange ? `<li><b>Timerange</b>: ` + timerange + `</li>` : "") +
      `</ul>`;
    return template;
  }

  private static buildDataTooltip(
    reftime: string,
    level: string,
    timerange: string
  ) {
    const template =
      `<ul class="p-1 m-0">
                <li><b><u>Data</u></b></li><li><b>Reftime: </b>${reftime}</li>` +
      `<li><b>Level: </b>${level}</li>` +
      `<li><b>Timerange: </b>${timerange}</li>` +
      `</ul>`;
    return template;
  }

  private buildLegend(product: string, min: number, max: number) {
    let srv = this.obsService;
    this.legend.onAdd = function (map, service = srv) {
      console.log(
        `add legend for product ${product} (${min.toFixed(2)}, ${max.toFixed(
          2
        )})`
      );
      let div = L.DomUtil.create("div", "info mst-legend");
      let halfDelta = (max - min) / (COLORS.length * 2);
      let bcode = VAR_TABLE.find((x) => x.bcode === product);
      let title = product,
        scale = 1,
        offset = 0,
        userunit = "n/a";
      if (bcode) {
        title = bcode.short || bcode.description;
        userunit = bcode.userunit;
        (scale = bcode.scale), (offset = bcode.offset);
      }

      div.innerHTML += `<h6>${title} [${userunit}]</h6>`;
      for (let i = 0; i < COLORS.length; i++) {
        let grade = min + halfDelta * (i * 2 + 1);
        div.innerHTML +=
          '<i style="background:#' +
          service.getColor(grade, min, max) +
          '"></i><span>' +
          // (grade*scale+offset).toPrecision(5).replace(/\.?0+$/,"")
          Math.floor(grade * scale + offset) +
          "</span><br>";
      }
      return div;
    };
    this.legend.addTo(this.map);
  }
}
