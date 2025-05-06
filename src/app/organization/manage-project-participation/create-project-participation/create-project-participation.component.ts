import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-create-project-participation',
  templateUrl: './create-project-participation.component.html',
  styleUrls: ['./create-project-participation.component.scss']
})
export class CreateProjectParticipationComponent implements OnInit {
  projectParticipationsData: any[] = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'project',
    'participant',
    'amount',
    'date',
    'status',
    'actions'
  ];

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { projectparticipations: any }) => {
      this.projectParticipationsData = [];
      data.projectparticipations.forEach((item: any) => {
        item.createdOnDate = new Date(item.createdOnDate);
        this.projectParticipationsData.push(item);
      });
      this.dataSource = new MatTableDataSource(this.projectParticipationsData);
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.projectParticipationsData);
  }
}
