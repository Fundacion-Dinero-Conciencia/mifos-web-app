import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';
import { showGlobalLoader, hideGlobalLoader } from 'app/shared/helpers/loaders';
import { DatePipe } from '@angular/common';

type PayrollStatus = 'EXITOSA' | 'PARCIAL' | 'FALLIDA' | 'PENDIENTE';

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

@Component({
  selector: 'mifosx-conciliation-payout',
  templateUrl: './conciliation-payout.component.html',
  styleUrls: ['./conciliation-payout.component.scss']
})
export class ConciliationPayoutComponent implements OnInit {
  filters: UntypedFormGroup;
  constructor(
    private fb: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private systemService: SystemService,
    private datePipe: DatePipe
  ) {}
  currency = 'CLP';
  dataSource = new MatTableDataSource<ConciliationRow>([]);
  pageIndex = 0;
  pageSize = 5;
  totalItems = 0;
  showDialogTransactions = false;
  isDebtorDetail = false;
  showDialogAssignation = false;
  operationType: any[] = [];
  selectedRowPartition: number[] = [];
  isconfirming = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = [
    'id',
    'investmentType',
    'subCredit',
    'loanNumber',
    'date',
    'aprovedNumber',
    'failNumber',
    'pendingNumber',
    'status',
    'actions'
  ];
  statusOptions = [
    {
      id: 300,
      name: 'Pendiente'
    },
    {
      id: 400,
      name: 'Exitoso'
    },
    {
      id: 600,
      name: 'Fallido'
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
    'amount',
    'actions'
  ];
  detailDataSource = new MatTableDataSource<any>([]);
  assignDataSource = new MatTableDataSource<any>([]);
  detailedRow: any = null;
  inputsGroup: any[];
  selectorsGroup: any[] = [];
  availableLoans: any[] = [];
  findOperationTypeById(id: number): string {
    const operation = this.operationType.find((op) => op.id === id);
    return operation ? operation.name : 'Desconocido';
  }
  ngOnInit(): void {
    this.operationType = [
      { id: 200, name: ' Pago de crédito' },
      { id: 100, name: 'Cuotas de inversion' }
    ];

    this.filters = this.fb.group({
      type: [''],
      startDate: [''],
      endDate: [''],
      status: ['']
    });
    this.loadPage(0, this.pageSize);
  }

  getPayrollStatus(row: {
    numberOfOrdersSuccess?: number;
    numberOfOrdersPending?: number;
    numberOfOrdersFailed?: number;
  }) {
    const success = Number(row.numberOfOrdersSuccess ?? 0);
    const pending = Number(row.numberOfOrdersPending ?? 0);
    const failed = Number(row.numberOfOrdersFailed ?? 0);

    const total = success + pending + failed;

    if (total === 0) return 'PENDIENTE';

    if (failed === total) return 'FALLIDA';

    if (success === total) return 'EXITOSA';

    if (pending === total) return 'PENDIENTE';

    return 'PARCIAL';
  }

  downloadDocument(entityId: string, documentId: string) {
    this.organizationService.downloadLoanOrder(entityId, documentId).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  loadPage(page: number, size: number, filters?: any) {
    const requestParams = {
      ...filters,
      page,
      size,
      sort: 'transactionDate'
    };
    showGlobalLoader();
    this.organizationService.getShinkansenOrdersPayout({ ...requestParams }).subscribe((response: any) => {
      this.dataSource.data = response.content || response;
      this.pageSize = size;
      this.pageIndex = page;
      this.totalItems = response.totalElements;
      hideGlobalLoader();
    });
  }
  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize, this.filters.value);
  }

  applyFilters(): void {
    this.paginator.firstPage();
    const startDate = this.datePipe.transform(this.filters.value.startDate, 'yyyy-MM-dd');
    const endDate = this.datePipe.transform(this.filters.value.endDate, 'yyyy-MM-dd');
    this.loadPage(0, this.pageSize, { ...this.filters.value, startDate, endDate });
  }

  onClear() {
    this.filters.reset({
      type: '',
      status: '',
      startDate: '',
      endDate: ''
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
      console.log(row.transactionDataList);
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
    this.detailedRow = row;
    this.selectedRowPartition = [
      0
    ];
    this.inputsGroup = [
      0
    ];
    this.assignDataSource.data = this.selectedRowPartition || [];
    this.showDialogAssignation = true;
  }
  viewAssignationDebtor(row: any) {
    showGlobalLoader();
    this.organizationService.getLoanDataByClientId(row.clientId).subscribe((loanData: any) => {
      this.availableLoans = [...loanData];
      this.showDialogAssignation = true;
      hideGlobalLoader();
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
    this.assignDataSource.data = [...this.selectedRowPartition];
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
    const listPayload = this.selectedRowPartition
      .map((amount, index) => ({
        loanId: loans?.[index] || null,
        amount
      }))
      .filter((item) => item.amount !== 0 && item.amount !== undefined && item.amount !== null);
    showGlobalLoader();
    this.organizationService.assignPayingById(id, listPayload).subscribe(() => {
      this.closeTransactionAssignation();
      this.applyFilters();
      hideGlobalLoader();
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

      if (!this.isDebtorDetail) {
        this.detailedRow && this.detailedRow.amount !== this.totalAssignedAmount && (disable = true);
      }

      this.totalAssignedAmount <= 1 && (disable = true);

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
}
