import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';

@Component({
  selector: 'mifosx-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  dataSource = new MatTableDataSource<any>([
    { title: 'Notificación de vencimiento' }]);
  @ViewChild('menuTable', { static: true }) instructionTableRef: MatTable<Element>;

  displayedColumnsMethods: string[] = [
    'title'
  ];

  constructor() {}
}
