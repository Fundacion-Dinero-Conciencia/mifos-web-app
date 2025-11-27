import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { SystemService } from 'app/system/system.service';
import { finalize } from 'rxjs/operators';
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
  currency: string;
  loading: boolean = false;
  displayedColumns: string[] = [
    'project',
    'RUT',
    'participant',
    'amount',
    'commission',
    'paymentType',
    'date',
    'status',
    'actions'
  ];
  selectedItems: any[] = [];
  selectedInvests: any[] = [];
  amountToInvest: number = 0;
  filterStatus: string = '';
  filterText: string = '';
  reservationSelected: any;
  showDialog = false;
  dataSourceInvestSelection: MatTableDataSource<any> = new MatTableDataSource<any>();

  displayedColumnsInvestSelection: string[] = [
    'Date',
    'Bank',
    'Amount',
    'Transactions',
    'Add'
  ];

  onDialogCancel() {
    this.showDialog = false;
  }

  openAssignTransfersDialog(reservation: any) {
    this.reservationSelected = reservation;
    this.getTransactions(reservation.participantId, reservation.id);
    this.showDialog = true;
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
    private accountTransfersService: AccountTransfersService,
    private systemService: SystemService
  ) {
    this.route.data.subscribe((data: { projectparticipations: any }) => {
      this.projectParticipationsData = [];
      data.projectparticipations.forEach((item: any) => {
        item.createdOnDate = new Date(item.createdOnDate);
        this.projectParticipationsData.push(item);
      });
      this.applyOwnerFilter();
      this.dataSource = new MatTableDataSource(this.projectParticipationsData);
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  ngOnInit(): void {
    this.getDefaultCurrency();
    this.dataSource = new MatTableDataSource(this.projectParticipationsData);
    this.dataSourceInvestSelection = new MatTableDataSource([]);

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const parsedFilter = JSON.parse(filter);
      const matchesStatus = !parsedFilter.status || data.status?.value === parsedFilter.status;
      const matchesText =
        !parsedFilter.text ||
        data.projectName.toLowerCase().includes(parsedFilter.text.toLowerCase()) ||
        !parsedFilter.text ||
        (data.rut + '').toLowerCase().includes(parsedFilter.text.toLowerCase());
      return matchesStatus && matchesText;
    };
  }

  getTransactions(participantId: number, paticipationId: number) {
    this.organizationservice.getTransactions(participantId, paticipationId).subscribe((data: any) => {
      this.dataSourceInvestSelection = new MatTableDataSource(data);
    });
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

  applyOwnerFilter() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (state) {
      this.projectParticipationsData = this.projectParticipationsData.filter(
        (project) => project.participantId === state.ownerId
      );
    }
  }

  processInvestments(): void {
    const dataToSend = this.selectedItems.map((item) => item.selectedData);

    this.accountTransfersService.createMultipleInvestment(dataToSend).subscribe({
      next: (response) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  assignTransaction() {
    this.loading = true;

    this.organizationservice
      .assignTransactions({
        projectParticipationId: this.reservationSelected.id,
        savingsTransactionId: this.selectedInvests
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (data: any) => {
          this.showDialog = false;
          this.selectedInvests = [];
          this.reload();
        },
        error: (err) => {
          console.error('Error asignando transacción:', err);
          // aquí puedes poner alert si quieres
        }
      });
  }

  get totalAmountSelected() {
    if (!this.reservationSelected) {
      return 0;
    }
    return this.reservationSelected?.amount + this.reservationSelected?.commission;
  }

  get amoutToBeAssigned() {
    const amount = (this.totalAmountSelected || 0) - (this.reservationSelected?.assignedAmount || 0);
    return amount;
  }

  isReservationFullyAssigned(participation: any): boolean {
    return participation.assignedAmount >= participation.amount + participation.commission;
  }

  navigateToCreate() {
    this.router.navigate(['/organization/project-participation/create']);
  }
  onInvestSelected(event: any, invest: any) {
    if (event.checked) {
      this.selectedInvests.push(invest.id);
      this.amountToInvest += invest.amount;
    } else {
      this.selectedInvests = this.selectedInvests.filter((id) => id !== invest.id);
      this.amountToInvest -= invest.amount;
    }
  }
}
