import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { hideGlobalLoader, showGlobalLoader } from 'app/shared/helpers/loaders';

@Component({
  selector: 'mifosx-payment-order',
  templateUrl: './payment-order.component.html',
  styleUrls: ['./payment-order.component.scss']
})
export class PaymentOrderComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService
  ) {}
  // Header info (idealmente viene del endpoint)
  promissoryNo = '12345';
  subCreditNo = 'TEST46TSTC01';
  installmentNo = 0;
  currentPeriodInfo: any;
  currency = 'CLP';

  // Bar superior (idealmente viene del endpoint)
  includedCount = 0;
  totalCount = 0;
  totalToDisperse = 18000000;
  showDialog = false;
  displayedColumns: string[] = [
    'select',
    'investor',
    'rut',
    'participation',
    'installmentAmount',
    'amountToPay',
    'amountToReinvest'
  ];

  dataSource = new MatTableDataSource<any>([]);

  // Paginación
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  inputSearch = '';
  rowsSelected: any[] = [];
  rowInputs: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.currentPeriodInfo = history?.state.paymentPeriodInfo;
    this.installmentNo = this.currentPeriodInfo ? this.currentPeriodInfo.period : 0;
    if (!this.currentPeriodInfo) {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
    this.loadPage(0, this.pageSize);
  }

  generatePayment() {
    console.log('Generando orden de pago...');
  }

  get masterChecked(): boolean {
    const rows = this.dataSource.data;
    return rows.length > 0 && rows.every((r) => r.selected);
  }

  get masterIndeterminate(): boolean {
    const rows = this.dataSource.data;
    const some = rows.some((r) => r.selected);
    const all = rows.length > 0 && rows.every((r) => r.selected);
    return some && !all;
  }

  get totalToDisperseCalculated(): number {
    if (this.rowsSelected.length === 0) {
      return 0;
    }
    const total = this.rowsSelected.reduce((sum, row) => {
      const amountToPay = parseFloat(row.amountToPay) || 0;
      return sum + amountToPay;
    });
    return total;
  }

  toggleAll(checked: boolean): void {
    this.dataSource.data = this.dataSource.data.map((r) => ({ ...r, selected: checked }));
  }

  loadPage(page: number, size: number, filters?: any) {
    const requestParams = {
      ...filters,
      page,
      size,
      sort: 'id'
    };
    showGlobalLoader();
    const loanId = this.route.snapshot.paramMap.get('id');
    this.organizationService
      .getPayoutOrders(Number(loanId), Number(1), { ...requestParams })
      .subscribe((response: any) => {
        this.dataSource.data = response.content || response;
        this.rowInputs = this.dataSource.data.map((row) => ({
          amountToPay: row.amount,
          amountToReinvest: 0
        }));
        this.pageSize = size;
        this.pageIndex = page;
        this.totalItems = response.totalElements;
        this.totalCount = response.totalElements;
        hideGlobalLoader();
      });
  }
  onAmountToPayChange(rowIndex: number, totalAmount: number, event: any): void {
    const value = event.target.value;
    console.log(value);
    const amount = (parseFloat(value) || 0) > totalAmount ? totalAmount : parseFloat(value) || 0;
    event.target.value = amount;

    this.rowInputs[rowIndex].amountToReinvest = String(totalAmount - amount);
    this.rowInputs[rowIndex].amountToPay = String(amount);
  }
  onAmountToReinvestChange(rowIndex: number, totalAmount: number, event: any): void {
    const value = event.target.value;
    console.log(value);

    const amount = (parseFloat(value) || 0) > totalAmount ? totalAmount : parseFloat(value) || 0;
    event.target.value = amount;
    this.rowInputs[rowIndex].amountToPay = String(totalAmount - amount);
    this.rowInputs[rowIndex].amountToReinvest = String(amount);
  }
  toggleRow(row: any, checked: boolean): void {
    row.selected = checked;
  }

  onRowEdited(row: any): void {
    // Hook para marcar dirty / habilitar guardar, etc.
  }

  onFilter(value: string): void {
    this.inputSearch = value;
  }

  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize, this.inputSearch);
  }

  onCancel(): void {
    // navegar o reset
  }

  onSaveChanges(): void {
    // enviar payload al backend
  }

  onGeneratePayroll(): void {
    this.showDialog = true;
  }
}
