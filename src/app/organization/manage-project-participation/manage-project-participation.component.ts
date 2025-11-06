import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { OrganizationService } from '../organization.service';
import { SelectDialogComponent } from '../select-dialog/select-dialog.component';

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
    'commission',
    'paymentType',
    'date',
    'status',
    'actions'
  ];
  selectedItems: any[] = [];
  filterStatus: string = '';
  filterText: string = '';

  showDialog = false;

  onDialogConfirm(result: { confirm: true }) {
    this.showDialog = false;
  }

  onDialogCancel() {
    this.showDialog = false;
  }

  statusId: Record<number, string> = {
    100: 'Accepted',
    200: 'Pending',
    300: 'Canceled',
    400: 'Reserved'
  };

  statuses = [
    { id: 100 },
    { id: 200 },
    { id: 300 },
    { id: 400 }];
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
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const parsedFilter = JSON.parse(filter);
      const matchesStatus = !parsedFilter.status || data.status?.value === parsedFilter.status;
      const matchesText =
        !parsedFilter.text || data.projectName.toLowerCase().includes(parsedFilter.text.toLowerCase());
      return matchesStatus && matchesText;
    };
  }

  applyFilter(filterValue: string) {
    this.filterText = filterValue.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify({
      status: this.filterStatus,
      text: this.filterText
    });
  }
  applySelectFilter(filterValue: string) {
    this.filterStatus = filterValue;
    this.dataSource.filter = JSON.stringify({
      status: this.filterStatus,
      text: this.filterText
    });
  }

  assignBankTransfers(item: any) {
    this.showDialog = true;
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
    return this.statusId[status];
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
        result.amount = item.amount;
        result.commission = item.commission;
        result.projectId = item.id;
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

  navigateToCreate() {
    this.router.navigate(['/organization/project-participation/create']);
  }
}
