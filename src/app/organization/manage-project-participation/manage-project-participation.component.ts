import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'mifosx-manage-project-participation',
  templateUrl: './manage-project-participation.component.html',
  styleUrls: ['./manage-project-participation.component.scss']
})
export class ManageProjectParticipationComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projectParticipationsData: any[] = [];
  dataSource: MatTableDataSource<any>;
  currency: string;
  loading: boolean = false;
  displayedColumns: string[] = [
    'projectName',
    'rut',
    'participantName',
    'amount',
    'commission',
    'paymentType',
    'date',
    'status',
    'actions'
  ];

  sortColumn: string = '';
  selectedItems: any[] = [];
  selectedInvests: any[] = [];
  amountToInvest: number = 0;
  filterStatus: string = '';
  filterText: string = '';
  private valueText$ = new Subject<string>();
  reservationSelected: any;
  showDialog = false;
  dataSourceInvestSelection: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;
  byProjectParticipationList = false;
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

  loadParticipations() {
    this.organizationservice
      .getInvestmentProjectParticipations({
        page: this.pageIndex,
        size: this.pageSize,
        search: this.filterText,
        sort: this.sortColumn,
        status: this.filterStatus
      })
      .subscribe((data: any) => {
        this.projectParticipationsData = data.content;
        this.totalItems = data.totalElements;
        this.dataSource.data = this.projectParticipationsData;
      });
  }
  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadParticipations();
  }
  onSortChange(sort: any) {
    this.sortColumn = sort.active;
    this.paginator.firstPage();
    this.loadParticipations();
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
    400: 'Reserved',
    500: 'Assigned'
  };

  statuses = [
    { id: 100 },
    { id: 200 },
    { id: 300 },
    { id: 400 },
    { id: 500 }];
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
      this.applyOwnerFilter();
      this.dataSource = new MatTableDataSource([]);
      if (data.projectparticipations) {
        this.projectParticipationsData = data.projectparticipations;
        this.dataSource.data = this.projectParticipationsData;
        this.byProjectParticipationList = true;
      }
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    this.getDefaultCurrency();
    if (!this.byProjectParticipationList) {
      this.loadParticipations();
    }
    this.dataSourceInvestSelection = new MatTableDataSource([]);
    this.valueText$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((value) => {
      this.paginator.firstPage();
      this.filterText = value;
      this.loadParticipations();
    });
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
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      if (property === 'createdOnDate') {
        const v = item.createdOnDate;

        // Mifos: [YYYY, M, D]
        if (Array.isArray(v)) {
          const [
            y,
            m,
            d
          ] = v;
          return new Date(y, m - 1, d).getTime();
        }

        // Por si viene string/Date
        return v ? new Date(v).getTime() : 0;
      }
      if (property === 'status') {
        return item.status?.value;
      }

      return item[property];
    };
  }
  getTransactions(participantId: number, paticipationId: number) {
    this.organizationservice.getTransactions(participantId, paticipationId).subscribe((data: any) => {
      this.dataSourceInvestSelection = new MatTableDataSource(data);
    });
  }

  applyFilter(filterValue: string) {
    this.valueText$.next(filterValue.trim().toLowerCase());
  }
  applySelectFilter(filterValue: string) {
    this.filterStatus = filterValue;
    this.loadParticipations();
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
