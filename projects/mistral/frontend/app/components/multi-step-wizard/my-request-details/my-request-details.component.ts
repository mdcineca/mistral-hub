import { Component, Input, OnInit } from "@angular/core";
import { FormDataService, FormData } from "@app/services/formData.service";
import { DataService } from "@app/services/data.service";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "mst-my-request-details",
  templateUrl: "./my-request-details.component.html",
  styleUrls: ["./my-request-details.component.css"],
})
export class MyRequestDetailsComponent implements OnInit {
  myRequest: FormData;
  @Input() onSubmitStep = false;

  constructor(
    private formDataService: FormDataService,
    public dataService: DataService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.myRequest = this.formDataService.getFormData();
  }

  emptyName() {
    return !this.myRequest.name || this.myRequest.name.trim().length === 0;
  }

  open(content) {
    this.modalService.open(content).result.then(
      (result) => {
        console.log("open license content");
      },
      (reason) => {
        // do nothing
      }
    );
  }
}
