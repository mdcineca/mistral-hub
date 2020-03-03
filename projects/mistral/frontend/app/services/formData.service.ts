import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as moment from 'moment';

import {WorkflowService} from '@app/services/workflow.service';
import {STEPS} from '@app/services/workflow.model';
import {DataService, Filters, RapydoResponse, SummaryStats, TaskSchedule, RefTime} from "./data.service";

export class FormData {
    name: string = '';
    reftime: RefTime = this.defaultRefTime();
    datasets: string[] = [];
    filters: Filters[] = [];
    postprocessors: any[] = [];
    schedule: TaskSchedule;
    output_format = '';

    clear() {
        this.name = '';
        this.datasets = [];
        this.filters = [];
        this.postprocessors = [];
        this.output_format = '';
        this.schedule = null;
        this.reftime = this.defaultRefTime();
    }

    setSchedule(schedule: TaskSchedule) {
        this.schedule = schedule;
    }

    defaultName() {
        this.name = this.datasets.join(' ').trim();
    }

    defaultRefTime(): RefTime {
        return {
            from: moment.utc().subtract(3, 'days').set({hour:0,minute:0,second:0,millisecond:0}).toDate(),
            to: moment.utc().toDate()
        };
    }
}

@Injectable({
  providedIn: 'root'
})
export class FormDataService {

    private formData: FormData = new FormData();
    private isDatasetFormValid: boolean = false;
    private isFilterFormValid: boolean = false;
    private isPostprocessFormValid: boolean = false;

    constructor(private workflowService: WorkflowService, private dataService: DataService) {
    }

    getDatasets() {
        return this.dataService.getDatsets();
    }

    setDatasets(data: string[]) {
        // Update Datasets only when the Dataset Form had been validated successfully
        this.isDatasetFormValid = true;
        this.formData.datasets = data;
        // Validate Dataset Step in Workflow
        this.workflowService.validateStep(STEPS.dataset);
    }

    isDatasetSelected(datasetId: string): boolean {
        return this.formData.datasets.some(x => x === datasetId);
    }

    /**
     * Retrieve the filters available for the selected datasets.
     * Optionally the dataset coverage can be restricted with respect to the reference time.
     * If reftime is omitted the whole historical dataset will be considered.
     */
    getFilters() {
        let query = this.parseRefTime();
        return this.dataService.getSummary(this.formData.datasets, query);
    }

    /**
     * Return arkimet query for reftime or null.
     */
    private parseRefTime(): string {
        let query = null;
        if(this.formData.reftime) {
            let arr = [];
            if(this.formData.reftime.from) {arr.push(`>=${moment(this.formData.reftime.from).format("YYYY-MM-DD HH:mm")}`);}
            if(this.formData.reftime.to) {arr.push(`<=${moment(this.formData.reftime.to).format("YYYY-MM-DD HH:mm")}`);}
            query = `reftime: ${arr.join(',')}`;
            console.log(query);
        }
        return query;
    }

    getReftime() {
        return this.formData.reftime;
    }

    getDefaultRefTime() {
        return this.formData.defaultRefTime();
    }

    setReftime(value?: RefTime) {
        if (value === undefined) {
            // default reftime
            this.formData.reftime = this.formData.defaultRefTime();
        } else {
            this.formData.reftime = value;
        }
    }

    getSummaryStats(): Observable<RapydoResponse<SummaryStats>> {
        let q = this.formData.filters.map(filter => filter.query).join(';');
        let reftime = this.parseRefTime();
        if (reftime) {
            // prepend the reftime
            q = (q !== '') ? [reftime, q].join(';') : reftime;
        }
        console.log(`query for summary stats ${q}`);
        return this.dataService.getSummary(
            this.formData.datasets, q, true);
    }

    setFilters(data: any) {
        // Update Filters only when the Filter Form had been validated successfully
        this.isFilterFormValid = true;
        this.formData.filters = data;
        // Validate Filter Step in Workflow
        this.workflowService.validateStep(STEPS.filter);
    }

    isFilterSelected(filter) {
        for (let f of this.formData.filters) {
            if (f.name === filter.t &&
                f.values.filter(i => i.desc === filter.desc).length) {
                return true;
            }
        }
        return false;
    }

    setPostProcessor(data: any) {
        // Update Postprocess only when the Postprocess Form had been validated successfully
        this.isPostprocessFormValid = true;
        this.formData.postprocessors = data;
        // Validate Filter Step in Workflow
        this.workflowService.validateStep(STEPS.postprocess);
    }

    getFormData(): FormData {
        // Return the entire Form Data
        return this.formData;
    }

    resetFormData(): FormData {
        // Reset the workflow
        this.workflowService.resetSteps();
        // Return the form data after all this.* members had been reset
        this.formData.clear();
        this.isDatasetFormValid = this.isFilterFormValid = this.isPostprocessFormValid = false;
        return this.formData;
    }

    isFormValid() {
        // Return true if all forms had been validated successfully; otherwise, return false
        return this.isDatasetFormValid &&
            this.isFilterFormValid &&
            this.isPostprocessFormValid;
    }

    setOutputFormat(data: any){
        this.formData.output_format = data;
    }

}
