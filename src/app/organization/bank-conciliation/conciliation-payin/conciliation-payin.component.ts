import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';
import { showGlobalLoader, hideGlobalLoader } from 'app/shared/helpers/loaders';
import { finalize } from 'rxjs/operators';

export interface ConciliationRow {
  systemDate: string | Date;
  rut: string;
  clientType: string;
  clientName: string;
  transactionId: string;
  totalAmount: number;
  assignmentsCount: number;
  status: 'CONCILIADO' | 'PENDIENTE' | 'NO_ENCONTRADO' | string;
}

const statuses = {
  FAILED: 'Fallido',
  INVALID: 'No detectado',
  APPLIED: 'Aplicado',
  RECEIVED: 'Recibido',
  PENDING: 'Pendiente',
  CONCILIATED: 'Conciliado',
  NOT_FOUND: 'No encontrado',
  IRRECONCILABLE: 'No conciliable'
};

@Component({
  selector: 'mifosx-conciliation-payin',
  templateUrl: './conciliation-payin.component.html',
  styleUrls: ['./conciliation-payin.component.scss']
})
export class ConciliationPayinComponent implements OnInit {
  filters: UntypedFormGroup;
  constructor(
    private fb: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private systemService: SystemService
  ) {}
  currency = 'CLP';
  dataSource = new MatTableDataSource<ConciliationRow>([]);
  pageIndex = 0;
  pageSize = 5;
  totalItems = 0;
  showDialogTransactions = false;
  isDebtorDetail = false;
  showDialogAssignation = false;
  clientOptions: any[] = [];
  selectedRowPartition: number[] = [];
  isconfirming = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = [
    'systemDate',
    'rut',
    'payinType',
    'clientType',
    'clientName',
    'transactionId',
    'totalAmount',
    'assignmentsCount',
    'status',
    'actions'
  ];
  statusOptions = [
    {
      id: 0,
      name: 'No detectado'
    },
    {
      id: 200,
      name: 'Aplicado'
    },
    {
      id: 100,
      name: 'Recibido'
    },
    {
      id: 300,
      name: 'Pendiente'
    },
    {
      id: 400,
      name: 'Conciliado'
    },
    {
      id: 500,
      name: 'No encontrado'
    },
    {
      id: 900,
      name: 'No conciliable'
    }
  ];
  detailDisplayedColumns: string[] = [
    'assignment',
    'project',
    'amount',
    'paymentId',
    'view'
  ];
  assignDisplayedColumns: string[] = [
    'assignment',
    'date',
    'amount',
    'actions'
  ];
  detailDataSource = new MatTableDataSource<any>([]);
  assignDataSource = new MatTableDataSource<any>([]);
  detailedRow: any = null;
  inputsGroup: any[];
  selectorsGroup: any[] = [];
  availableLoans: any[] = [];
  availableParticipations: any[] = [];
  selectedParticipationIds: number[] = [];

  ngOnInit(): void {
    this.systemService.getCodeByName('ClientType').subscribe((data: any) => {
      this.clientOptions = data.codeValues;
    });

    this.filters = this.fb.group({
      clientTypeId: [''],
      rut: [''],
      notificationId: [''],
      status: ['']
    });
    this.loadPage(0, this.pageSize);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'INVALID':
        return 'No detectado';
      case 'APPLIED':
        return 'Aplicado';
      case 'RECEIVED':
        return 'Recibido';
      case 'PENDING':
        return 'Pendiente';
      case 'CONCILIATED':
        return 'Conciliado';
      case 'NOT_FOUND':
        return 'No encontrado';
      case 'IRRECONCILABLE':
        return 'No conciliable';
      default:
        return status || '-';
    }
  }

  loadPage(page: number, size: number, filters?: any) {
    const requestParams = {
      ...filters,
      page,
      size,
      sort: 'transactionDate'
    };
    showGlobalLoader();
    this.organizationService
      .getShinkansen({ ...requestParams })
      .pipe(
        finalize(() => {
          hideGlobalLoader();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.dataSource.data = response.content || response;
          this.pageSize = size;
          this.pageIndex = page;
          this.totalItems = response.totalElements;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }
  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize, this.filters.value);
  }

  applyFilters(): void {
    this.paginator.firstPage();
    this.loadPage(0, this.pageSize, this.filters.value);
  }

  onClear() {
    this.filters.reset({
      clientTypeId: '',
      rut: '',
      notificationId: '',
      status: ''
    });
    this.applyFilters();
  }

  viewDetailsInvestor(row: any) {
    this.isDebtorDetail = false;
    this.detailedRow = row;
    this.detailDataSource.data = row.transactionDataList || [];
    this.showDialogTransactions = true;
  }

  viewDetailsDebtor(row: any) {
    this.isDebtorDetail = true;
    this.detailedRow = row;
    this.detailDataSource.data = row.transactionDataList || [];
    this.showDialogTransactions = true;
  }

  viewDetails(row: any) {
    if (!row) {
      return;
    }
    if (row.clientType.name.includes('Crédito')) {
      this.viewDetailsDebtor(row);
    } else if (row.clientType.name.includes('Inversión')) {
      this.viewDetailsInvestor(row);
    } else {
      const isDebtor = row.transactionDataList.some(
        (transaction: any) => transaction.loanId !== null && transaction.loanId !== undefined
      );
      if (isDebtor) {
        this.viewDetailsDebtor(row);
      } else {
        this.viewDetailsInvestor(row);
      }
    }
  }

  viewAssignation(row: any) {
    showGlobalLoader();

    this.organizationService
      .getProjectParticipationAvailable(row.clientId)
      .pipe(
        finalize(() => {
          hideGlobalLoader();
        })
      )
      .subscribe({
        next: (data: any) => {
          this.availableParticipations = [...data];
          this.showDialogAssignation = true;
          this.isDebtorDetail = false;
          this.detailedRow = row;
          this.selectedRowPartition = [
            0
          ];
          this.inputsGroup = [
            0
          ];
          this.assignDataSource.data = this.selectedRowPartition || [];
          this.showDialogAssignation = true;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  viewAssignationDebtor(row: any) {
    showGlobalLoader();
    this.organizationService
      .getLoanDataByClientId(row.clientId)
      .pipe(
        finalize(() => {
          hideGlobalLoader();
        })
      )
      .subscribe({
        next: (loanData: any) => {
          this.availableLoans = [...loanData];
          this.showDialogAssignation = true;
        },
        error: (error) => {
          console.error(error);
        }
      });

    this.detailedRow = row;
    this.isDebtorDetail = true;
    this.selectedRowPartition = [0];
    this.selectorsGroup = [undefined];
    this.inputsGroup = [0];
    this.assignDataSource.data = this.selectedRowPartition || [];
  }

  onClientTypeChange() {
    if (this.isDebtorDetail) {
      this.viewAssignationDebtor(this.detailedRow);
    } else {
      this.viewAssignation(this.detailedRow);
    }
  }

  deleteAmountByIndex(index: number): void {
    this.selectedRowPartition.splice(index, 1);
    this.inputsGroup.splice(index, 1);
    this.selectorsGroup.splice(index, 1);
    this.assignDataSource.data = [...this.selectedRowPartition];
  }

  findLoanByIndex(index: number): any {
    const loanId = this.selectorsGroup[index];
    if (loanId === undefined) {
      return null;
    }
    const loan = this.availableLoans.find((loan) => Number(loan.loanId) === Number(loanId));
    return loan;
  }

  onAmountChangeInput(event: Event, creditId: number, index: number): void {
    const target = event.target as HTMLInputElement;
    const amount = target.valueAsNumber;
    if (!this.isDebtorDetail || creditId === undefined) {
      this.inputsGroup[index] = amount;
      return;
    }
    const loan = this.availableLoans.find((loan) => Number(loan.loanId) === Number(creditId));
    if (amount > loan.totalAmount) {
      {
        target.value = loan.totalAmount.toString();
        this.inputsGroup[index] = loan.totalAmount;
      }
    } else {
      this.inputsGroup[index] = amount;
    }
  }
  changeSelectedGroup(event: any, index: number): void {
    const selectedValue = event.target.value;
    this.selectorsGroup[index] = selectedValue;
    this.inputsGroup[index] = 0;
  }
  closeDetailedRow() {
    this.isDebtorDetail = false;
    this.showDialogTransactions = false;
    this.detailedRow = null;
  }

  closeTransactionAssignation() {
    this.availableLoans = [];
    this.showDialogAssignation = false;
    this.detailedRow = null;
    this.selectedRowPartition = [];
    this.isconfirming = false;
    this.availableParticipations = [];
    this.selectedParticipationIds = [];
  }

  confirmAction() {
    if (!this.isconfirming) {
      this.isconfirming = true;
    }
  }
  getValuesConciliation(): number[] {
    if (!this.inputsGroup) {
      return [];
    }
    return [...this.inputsGroup];
  }
  getValuesLoanIds(): number[] {
    if (!this.selectorsGroup) {
      return [];
    }
    const stringValues = [...this.selectorsGroup];
    return stringValues.map((value) => (value !== undefined ? Number(value) : undefined));
  }

  getTotalAssignedAmount(): number {
    return this.getValuesConciliation().reduce((total, amount) => total + amount, 0);
  }

  get totalAssignedAmount(): number {
    return this.getTotalAssignedAmount();
  }

  getConciliationProgress(row: any): number {
    if (!row) {
      return 0;
    }
    let totalTransactions = 0;
    row.transactionDataList.forEach((transaction: any) => {
      totalTransactions += transaction.amount;
    });
    return totalTransactions > 0 ? (row.amount / totalTransactions) * 100 : 0;
  }

  addAssinmentAmount(): void {
    if (this.isDebtorDetail) {
      this.selectorsGroup.push(undefined);
    }
    this.selectedRowPartition.push(0);
    this.assignDataSource.data = [...this.selectedRowPartition];
  }

  assignPayingById(id: string): void {
    this.selectedRowPartition = this.getValuesConciliation();
    const loans = this.getValuesLoanIds();
    let listPayload = null;

    if (this.isDebtorDetail) {
      listPayload = this.selectedRowPartition
        .map((amount, index) => ({
          loanId: loans?.[index] || undefined,
          amount,
          participationId: undefined
        }))
        .filter((item) => item.amount !== 0 && item.amount !== undefined && item.amount !== null);
    } else {
      listPayload = this.inputsGroup.map((amount, index) => ({
        loanId: undefined,
        amount,
        participationId: this.selectedParticipationIds[index]
      }));
    }

    showGlobalLoader();
    this.organizationService
      .assignPayingById(id, listPayload)
      .pipe(
        finalize(() => {
          hideGlobalLoader();
        })
      )
      .subscribe({
        next: () => {
          this.closeTransactionAssignation();
          this.applyFilters();
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  get NonSelectedLoansOptions(): any[] {
    if (!this.availableLoans) {
      return [];
    }
    const loansSelected = this.getValuesLoanIds();
    return this.availableLoans.filter((loan) => !loansSelected.includes(Number(loan.loanId)));
  }

  getNonSelectedLoansOptionsExceptLoanId(loanId: number): any[] {
    if (!this.availableLoans) {
      return [];
    }
    if (loanId === undefined) {
      return this.NonSelectedLoansOptions;
    }
    const loansSelected = this.availableLoans.find((loan) => Number(loan.loanId) === Number(loanId));
    return [
      ...this.NonSelectedLoansOptions,
      loansSelected
    ];
  }

  get disableConfirmAssign(): boolean {
    let disable = false;
    if (this.detailedRow) {
      if (this.isDebtorDetail) {
        this.getValuesLoanIds().some((id) => id === undefined) && (disable = true);

        this.selectorsGroup.forEach((loanId, index) => {
          const loan = this.getLoanById(loanId);
          if (loan) {
            loan.totalAmount < this.inputsGroup[index] && (disable = true);
          }
        });
      }

      this.detailedRow && this.detailedRow.amount !== this.totalAssignedAmount && (disable = true);
      this.totalAssignedAmount <= 1 && (disable = true);
      this.detailedRow && this.detailedRow.amount < this.totalAssignedAmount && (disable = true);
      return disable;
    } else {
      return true;
    }
  }

  getLoanById(id: number): any {
    if (!this.availableLoans) {
      return null;
    }
    return this.availableLoans.find((loan) => Number(loan.loanId) === Number(id)) || null;
  }

  getNonSelectedParticipations(participationId: number): any[] {
    if (!this.availableParticipations) {
      return [];
    }
    if (participationId === undefined) {
      return this.NonSelectedParticipationsOptions;
    }
    const participationsSelected = this.availableParticipations.find((pp) => Number(pp.id) === Number(participationId));
    return [
      ...this.NonSelectedParticipationsOptions,
      participationsSelected
    ].filter(Boolean);
  }

  get NonSelectedParticipationsOptions(): any[] {
    if (!this.availableParticipations) {
      return [];
    }
    const participationsSelected = this.getValuesParticipationsIds();
    return this.availableParticipations.filter((pp) => !participationsSelected.includes(Number(pp.id)));
  }

  getValuesParticipationsIds(): number[] {
    return [...this.selectedParticipationIds];
  }

  changeSelectedParticipation(event: any, index: number): void {
    this.selectedParticipationIds[index] = Number(event.target.value);
    this.inputsGroup[index] = 0;
  }
}
