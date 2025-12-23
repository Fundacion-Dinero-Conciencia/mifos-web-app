import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';

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
  INVALID: 'No detectado',
  APPLIED: 'Aplicado',
  RECEIVED: 'Recibido',
  PENDING: 'Pendiente',
  CONCILIATED: 'Conciliado',
  NOT_FOUND: 'No encontrado'
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
  currency = 'CLP'; // o lo que uses en tu sistema
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
      id: 100,
      name: 'Aplicado'
    },
    {
      id: 200,
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
  selectorsGroup: any[];
  availableLoans: any[] = [];

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
      default:
        return status || '-';
    }
  }

  loadPage(page: number, size: number, filters?: any) {
    const requestParams = {
      ...filters,
      page,
      size
    };

    this.organizationService.getShinkansen({ ...requestParams }).subscribe((response: any) => {
      this.dataSource.data = response.content || response;
      this.pageSize = size;
      this.pageIndex = page;
      this.totalItems = response.totalElements;
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

  viewDetails(row: any) {
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
  viewAssignation(row: any) {
    this.detailedRow = row;
    this.selectedRowPartition = row.transactionDataList.map((t: any) => t.amount);
    this.inputsGroup = row.transactionDataList.map((t: any) => t.amount);
    this.assignDataSource.data = this.selectedRowPartition || [];
    this.showDialogAssignation = true;
  }
  viewAssignationDebtor(row: any) {
    this.organizationService.getLoanDataByClientId(row.clientId).subscribe((loanData: any) => {
      this.availableLoans = [];
      this.showDialogAssignation = true;
    });
    this.detailedRow = row;
    this.isDebtorDetail = true;
    this.selectedRowPartition = row.transactionDataList.map((t: any) => t.amount);
    this.inputsGroup = row.transactionDataList.map((t: any) => t.amount);
    this.assignDataSource.data = this.selectedRowPartition || [];
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
  getValuesLoans(): number[] {
    if (!this.selectorsGroup) {
      return [];
    }
    return [...this.selectorsGroup];
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
    this.selectedRowPartition.push(0);
    this.assignDataSource.data = [...this.selectedRowPartition];
  }

  assignPayingById(id: string): void {
    this.selectedRowPartition = this.getValuesConciliation();
    const loans = this.getValuesLoans();
    const listPayload = this.selectedRowPartition.map((amount, index) => ({
      loanId: loans?.[index] || null,
      amount
    }));
    this.organizationService.assignPayingById(id, listPayload).subscribe(() => {
      this.closeTransactionAssignation();
      this.applyFilters();
    });
  }
}
