import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { hideGlobalLoader, showGlobalLoader } from 'app/shared/helpers/loaders';
import { isNumber } from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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

  promissoryNo = '-';
  subCreditNo = '-';
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

  selectedDisplayedColumns: string[] = [
    'investor',
    'rut',
    'amountToPay',
    'amountToReinvest',
    'total'
  ];

  rowsSelected: any[] = [];

  dataSource = new MatTableDataSource<any>([]);
  dataSourceSelected = new MatTableDataSource<any>([]);

  // Paginación
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  inputSearch = '';
  private searchSubject = new Subject<string>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    if (!history?.state.paymentPeriodInfo) {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
    this.currentPeriodInfo = history?.state.paymentPeriodInfo.row;
    this.subCreditNo = history?.state.paymentPeriodInfo.subCreditInfo.accountNo;
    this.installmentNo = this.currentPeriodInfo ? this.currentPeriodInfo.period : 0;

    this.searchSubject.pipe(debounceTime(300)).subscribe((value) => {
      this.loadPage(0, this.pageSize, this.inputSearch);
    });

    this.loadPage(0, this.pageSize);
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
    let total = 0;
    this.rowsSelected.forEach((row) => (total = row.amount + total));
    return total;
  }

  toggleAll(checked: boolean): void {
    this.dataSource.data = this.dataSource.data.map((r) => ({ ...r, selected: checked }));
  }

  loadPage(page: number, size: number, search?: string) {
    const requestParams = {
      search,
      page,
      size
    };
    showGlobalLoader();
    const loanId = this.route.snapshot.paramMap.get('id');
    this.organizationService
      .getPayoutOrders(Number(loanId), Number(1), { ...requestParams })
      .subscribe((response: any) => {
        const tableContent = response.content.map((item: any) => ({
          ...item,
          amountToPay: isNumber(item.amountToPaid) ? item.amountToPaid : item.amount,
          amountToReinvest: item.amountToReinvest || 0,
          selected: false
        }));

        this.dataSource.data = tableContent;
        this.pageSize = size;
        this.pageIndex = page;
        this.totalItems = response.totalElements;
        this.totalCount = response.totalElements;
        hideGlobalLoader();
      });
  }
  onAmountToPayChange(id: number, index: number, totalAmount: number, event: any): void {
    const value = event.target.value;
    const amount = (parseFloat(value) || 0) > totalAmount ? totalAmount : parseFloat(value) || 0;
    event.target.value = amount;
    const row = this.rowsSelected.find((row) => row.id === id);

    row.amountToReinvest = String(totalAmount - amount);
    row.amountToPay = String(amount);

    this.dataSource.data[index].amountToPay = String(amount);
    this.dataSource.data[index].amountToReinvest = String(totalAmount - amount);
  }
  onAmountToReinvestChange(id: number, index: number, totalAmount: number, event: any): void {
    const value = event.target.value;
    const amount = (parseFloat(value) || 0) > totalAmount ? totalAmount : parseFloat(value) || 0;
    event.target.value = amount;
    const row = this.rowsSelected.find((row) => row.id === id);

    row.amountToPay = String(totalAmount - amount);
    row.amountToReinvest = String(amount);

    this.dataSource.data[index].amountToReinvest = String(amount);
    this.dataSource.data[index].amountToPay = String(totalAmount - amount);
  }

  isRowSelected(row: any): boolean {
    return this.rowsSelected.filter((r) => r.id === row.id).length > 0;
  }

  toggleRow(row: any, checked: boolean): void {
    if (checked && !this.isRowSelected(row)) {
      this.rowsSelected.push(row);
    } else {
      this.rowsSelected = this.rowsSelected.filter((r) => r.id !== row.id);
    }
    this.dataSourceSelected.data = this.rowsSelected;
    this.includedCount = this.rowsSelected.length;
  }

  onRowEdited(row: any): void {
    // Hook para marcar dirty / habilitar guardar, etc.
  }

  onFilter(value: string): void {
    this.inputSearch = value;
    this.searchSubject.next(value);
  }

  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize, this.inputSearch);
  }

  onCancel(): void {
    // navegar o reset
  }

  onSaveChanges(): void {
    showGlobalLoader();
    const data = this.rowsSelected.map((row, index) => ({
      amountToPaid: Number(row.amountToPay),
      amountToReinvest: Number(row.amountToReinvest),
      id: row.id
    }));
    this.organizationService.EditOrderPayout(data).subscribe((response: any) => {
      console.log('Cambios guardados', response);
      hideGlobalLoader();
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  generatePayment() {
    showGlobalLoader();
    const data = this.rowsSelected.map((row, index) => ({
      amountToPaid: Number(row.amountToPay),
      amountToReinvest: Number(row.amountToReinvest),
      id: row.id
    }));
    this.organizationService.createPayRoll(data).subscribe((response: any) => {
      hideGlobalLoader();
      this.router.navigate(['../../..'], { relativeTo: this.route });
    });
  }

  get atleastOneChecked(): boolean {
    return this.rowsSelected.length > 0;
  }

  onGeneratePayroll(): void {
    this.showDialog = true;
  }
}
