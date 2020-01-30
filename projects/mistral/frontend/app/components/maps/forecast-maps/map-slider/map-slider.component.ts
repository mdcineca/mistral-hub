import {Component, Input, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {MeteoFilter} from "../services/meteo.service";
import {Areas, Fields, Resolutions} from "../services/data";
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

const base_url = "https://meteo.cineca.it/media";

@Component({
    selector: 'app-map-slider',
    templateUrl: './map-slider.component.html',
    styleUrls: ['./map-slider.component.css']
})
export class MapSliderComponent implements OnInit, AfterViewInit {
    @Input() filter: MeteoFilter;
    today: Date = new Date();
    images: string[] = [];
    paused = true;

    @ViewChild('carousel', {static: true}) carousel: NgbCarousel;

    ngOnInit() {
        this.images = ['0003', '0004', '0005'].map((offset) => this.getImageUrl(offset));
    }
    ngAfterViewInit() {
        this.carousel.pause();
    }

    togglePaused() {
        if (this.paused) {
            this.carousel.cycle();
        } else {
            this.carousel.pause();
        }
        this.paused = !this.paused;
    }

    getLegendUrl() {
        return `${base_url}/${this.filter.platform}/${this.filter.modality}` +
            `/Magics-${this.filter.run}-${this.filter.resolution}.web` +
            `/legends/${this.filter.field}.png`
    }

    getValue(param: string, key: string) {
        switch (param) {
            case 'field':
                return Fields.find(f => f.key === key).value;
            case 'resolution':
                return Resolutions.find(r => r.key === key).value;
            case 'area':
                return Areas.find(a => a.key === key).value;
        }

    }

    /**
     * @param offset (00|01|02|03)[00-23]
     * @param date YYYYMMDD
     */
    getImageUrl(offset: string, date?: string) {
        if (!date) date = moment(this.today).format('YYYYMMDD');
        return `${base_url}/${this.filter.platform}/${this.filter.modality}` +
            `/Magics-${this.filter.run}-${this.filter.resolution}.web` +
            `/${this.filter.area}/${this.filter.field}/` +
            `${this.filter.field}.${date}${this.filter.run}.${offset}.png`;
    }

}
