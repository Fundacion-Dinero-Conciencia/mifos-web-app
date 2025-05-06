import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '../organization.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { SelectDialogComponent } from '../select-dialog/select-dialog.component';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';

@Component({
  selector: 'mifosx-manage-project-participation',
  templateUrl: './manage-project-participation.component.html',
  styleUrls: ['./manage-project-participation.component.scss']
})
export class ManageProjectParticipationComponent implements OnInit {
  projectParticipationsData: any[] = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'project',
    'participant',
    'amount',
    'date',
    'status',
    'actions',
    'select'
  ];
  selectedItems: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private organizationservice: OrganizationService,
    public dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private accountTransfersService: AccountTransfersService
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  manageRequest(request: any, command: string): void {
    const approveLoanRescheduleDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: `${this.translateService.instant('tooltips.' + command)} ${this.translateService.instant('labels.heading.Project Participation')}`,
        dialogContext: `${this.translateService.instant('labels.dialogContext.Are you sure you want')} 
           ${this.translateService.instant('tooltips.' + command)} 
          ${this.translateService.instant('labels.text.the Project Participation')} 
           ${request.participantName}`
      }
    });
    approveLoanRescheduleDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        let status = 100;
        if (command === 'Reject') {
          status = 300;
        } else if (command === 'Reserve') {
          status = 400;
        }
        const payload = {
          amount: request.amount,
          status
        };
        this.organizationservice
          .updateInvestmentProjectParticipations(request.id, payload)
          .subscribe((response: any) => {
            this.reload();
          });
      }
    });
  }

  statusCode(status: number) {
    if (status === 200) {
      return 'status-pending';
    } else if (status === 100) {
      return 'status-active';
    } else if (status === 300) {
      return 'status-matured';
    } else if (status === 400) {
      return 'text-primary';
    }
  }

  statusLabel(status: number) {
    if (status === 200) {
      return 'Pending';
    } else if (status === 100) {
      return 'Accepted';
    } else if (status === 300) {
      return 'Canceled';
    } else if (status === 400) {
      return 'Reserved';
    }
  }

  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients`, { skipLocationChange: true }).then(() => this.router.navigate([url]));
  }

  onSelectionChange(item: any): void {
    if (item.selected) {
      this.openSelectionModal(item);
    } else {
      this.selectedItems = this.selectedItems.filter((i) => i !== item);
    }
  }

  openSelectionModal(item: any): void {
    const dialogRef = this.dialog.open(SelectDialogComponent, {
      width: '400px',
      data: item
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        item.selectedData = result;
        this.selectedItems.push(item);
      } else {
        item.selected = false;
        this.selectedItems = this.selectedItems.filter((i) => i !== item);
      }
    });
  }

  processInvestments(): void {
    const dataToSend = this.selectedItems.map((item) => item.selectedData);

    this.accountTransfersService.createMultipleInvestment(dataToSend).subscribe({
      next: (response) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }
}
