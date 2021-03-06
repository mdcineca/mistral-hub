import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

import { User } from "@rapydo/types";
import { environment } from "@rapydo/../environments/environment";

@Component({
  selector: "customlinks",
  templateUrl: "./custom.navbar.links.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomNavbarComponent {
  @Input() user: User;

  constructor() {}
}

@Component({
  selector: "custombrand",
  templateUrl: "./custom.navbar.brand.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomBrandComponent {
  public myproject: string;

  constructor() {
    var t = environment.projectTitle;
    t = t.replace(/^'/, "");
    t = t.replace(/'$/, "");
    this.myproject = t;
  }
}
