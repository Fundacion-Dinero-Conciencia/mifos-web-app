import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'mifosx-not-permission',
  templateUrl: './not-permission.component.html',
  styleUrls: ['./not-permission.component.scss']
})
export class NotPermissionComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
