import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
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
export class ConciliationPayinComponent implements OnInit, AfterViewInit {
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
  clientOptions: any[] = [];
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

  detailDataSource = new MatTableDataSource<any>([]);
  detailedRow: any = null;

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
    this.organizationService.getShinkansen({}).subscribe((data: any) => {
      this.dataSource.data = data.content as any;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
      this.totalItems = response.total;
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
    this.detailedRow = row;
    this.detailDataSource.data = row.transactionDataList || [];
    this.showDialogTransactions = true;
  }

  closeDetailedRow() {
    this.showDialogTransactions = false;
    this.detailedRow = null;
  }

  getConciliationProgress(row: any): number {
    if (!row) {
      return 0;
    }
    let totalTransactions = 0;
    row.transactionDataList.forEach((transaction: any) => {
      totalTransactions += transaction.amount;
    });
    console.log(totalTransactions);
    return totalTransactions > 0 ? (row.amount / totalTransactions) * 100 : 0;
  }
}
