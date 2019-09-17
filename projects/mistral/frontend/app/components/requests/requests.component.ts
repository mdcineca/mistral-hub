import {Component, ViewChild, AfterViewChecked, ChangeDetectorRef} from '@angular/core';
import {saveAs as importedSaveAs} from "file-saver";
import {BasePaginationComponent} from '/rapydo/src/app/components/base.pagination.component';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApiService} from '/rapydo/src/app/services/api';
import {AuthService} from '/rapydo/src/app/services/auth';
import {NotificationService} from '/rapydo/src/app/services/notification';
import {FormlyService} from '/rapydo/src/app/services/formly'
import {DataService} from "../../services/data.service";

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.css']
})
export class RequestsComponent extends BasePaginationComponent implements AfterViewChecked {
    @ViewChild('tableWrapper', {static: false}) tableWrapper;
    @ViewChild('myRequestsTable', {static: false}) table: any;
    expanded: any = {};
    private currentComponentWidth;

    constructor(
        protected api: ApiService,
        protected auth: AuthService,
        protected notify: NotificationService,
        protected modalService: NgbModal,
        protected formly: FormlyService,
        private dataService: DataService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super(api, auth, notify, modalService, formly);
        this.init("request");

        this.server_side_pagination = true;
        this.endpoint = 'requests';
        this.counter_endpoint = 'requests';
        this.initPaging(20);
        this.list();
    }

    list() {
        return this.get(this.endpoint);
    }

    remove(requestID) {
        console.log(`remove this request ${requestID}`);
        return this.delete('requests', requestID);
    }

    download(filename) {
        this.dataService.downloadData(filename).subscribe(
            resp => {
                const contentType = resp.headers['content-type'] || 'application/octet-stream';
                const blob = new Blob([resp.body], {type: contentType});
                importedSaveAs(blob, filename);
            },
            error => {
                this.notify.showError(`Unable to download file: ${filename}`);
            }
        );
    }

    toggleExpandRow(row) {
        this.table.rowDetail.toggleExpandRow(row);
    }

    ngAfterViewChecked() {
        // Check if the table size has changed,
        if (this.table && this.table.recalculate && (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth)) {
            this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
            this.table.recalculate();
            this.changeDetectorRef.detectChanges();
        }
    }

}
