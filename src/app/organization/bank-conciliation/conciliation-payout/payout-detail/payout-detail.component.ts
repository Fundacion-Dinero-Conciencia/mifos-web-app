import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { hideGlobalLoader, showGlobalLoader } from 'app/shared/helpers/loaders';
import { SystemService } from 'app/system/system.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'mifosx-payout-detail',
  templateUrl: './payout-detail.component.html',
  styleUrls: ['./payout-detail.component.scss']
})
export class PayoutDetailComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private systemService: SystemService
  ) {}

  currency = 'CLP';

  conciliationId = '-';
  status = '-';

  displayedColumns: string[] = [
    'id',
    'investor',
    'rut',
    'participation',
    'installmentAmount',
    'amountToPay',
    'amountToReinvest',
    'status'
  ];

  dataSource = new MatTableDataSource<any>([]);
  dataSourceSelected = new MatTableDataSource<any>([]);
  rowsSelected: any[] = [];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  inputSearch = '';
  orderInfo: any = null;

  private search$ = new Subject<string>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  showDialog = false;

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  ngOnInit(): void {
    if (!history?.state.orderInfo) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
    this.orderInfo = history?.state.orderInfo;
    console.log(this.orderInfo);
    this.conciliationId = this.route.snapshot.paramMap.get('id') ?? '-';

    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.inputSearch = value;
      this.loadPage(0, this.pageSize, this.inputSearch);
    });

    this.loadPage(0, this.pageSize, '');
  }

  loadPage(page: number, size: number, search?: string): void {
    showGlobalLoader();
    const params = { page, size, search: search ?? '' };

    this.organizationService.getPayoutOrdersTramited(Number(this.conciliationId), params).subscribe({
      next: (response: any) => {
        const content = (response?.content ?? response ?? []).map((item: any) => ({
          ...item,
          selected: false
        }));

        this.dataSource.data = content;
        this.pageSize = size;
        this.pageIndex = page;
        this.totalItems = response?.totalElements ?? content.length;

        hideGlobalLoader();
      },
      error: () => hideGlobalLoader()
    });
  }
  capitalize(word: string) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  onPageChange(event: any): void {
    this.loadPage(event.pageIndex, event.pageSize, this.inputSearch);
  }

  onSearchInput(value: string): void {
    this.search$.next(value);
  }

  getRowStatusLabel(row: any): string {
    return row?.status ?? '-';
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  getPayrollStatus(data: {
    numberOfOrdersSuccess?: number;
    numberOfOrdersPending?: number;
    numberOfOrdersFailed?: number;
  }) {
    const success = Number(data.numberOfOrdersSuccess ?? 0);
    const pending = Number(data.numberOfOrdersPending ?? 0);
    const failed = Number(data.numberOfOrdersFailed ?? 0);

    const total = success + pending + failed;

    if (total === 0) return 'PENDIENTE';

    if (failed === total) return 'FALLIDA';

    if (success === total) return 'EXITOSA';

    if (pending === total) return 'PENDIENTE';

    return 'PARCIAL';
  }
}
