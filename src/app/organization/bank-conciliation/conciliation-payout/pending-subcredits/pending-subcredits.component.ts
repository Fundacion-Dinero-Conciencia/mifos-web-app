import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { hideGlobalLoader, showGlobalLoader } from 'app/shared/helpers/loaders';
import { SystemService } from 'app/system/system.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mifosx-pending-subcredits',
  templateUrl: './pending-subcredits.component.html',
  styleUrls: ['./pending-subcredits.component.scss']
})
export class PendingSubcreditsComponent implements OnInit {
  constructor(
    private fb: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private systemService: SystemService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  dataSource = new MatTableDataSource<any>([]);
  includedCount = 0;
  pageIndex = 0;
  pageSize = 5;
  totalItems = 0;
  totalCount = 0;
  currency = 'CLP';
  showConfirmationDialog = false;
  rowsSelected: any[] = [];

  pendingGroupsColumns: string[] = [
    'project',
    'rut',
    'documentNumber',
    'signedDate',
    'expensesAmount',
    'amountToBeDelivered',
    'amountToPay',
    'amountToReinvest'
  ];

  ngOnInit(): void {
    this.getDefaultCurrency();
    this.loadPage(0, this.pageSize);
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
      console.log(this.currency);
    });
  }

  loadPage(page: number, size: number) {
    const requestParams = {
      page,
      size
    };
    showGlobalLoader();
    this.organizationService
      .getPendingGroups({ ...requestParams })
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

  get totalToDisperseCalculated(): number {
    let total = 0;
    this.rowsSelected.forEach((row) => (total = total + row.amountToBeDelivered));
    return total;
  }

  get totalToPayCalculated(): number {
    return this.rowsSelected.reduce((total, row) => total + (Number(row.amountToPay) || 0), 0);
  }

  get totalToReinvestCalculated(): number {
    return this.rowsSelected.reduce((total, row) => total + (Number(row.amountToReinvest) || 0), 0);
  }

  hasAssignedAmount(row: any): boolean {
    return (
      (row.amountToPay !== null &&
        row.amountToPay !== undefined &&
        row.amountToPay !== '' &&
        Number(row.amountToPay) > 0) ||
      (row.amountToReinvest !== null &&
        row.amountToReinvest !== undefined &&
        row.amountToReinvest !== '' &&
        Number(row.amountToReinvest) > 0)
    );
  }

  onAmountToPayChange(event: any, row: any): void {
    const max = row.amountToBeDelivered ?? 0;

    let amountToPay = Number(event.target.value) || 0;

    // clamp directo
    amountToPay = Math.max(0, Math.min(amountToPay, max));

    // sync UI + model
    event.target.value = amountToPay;

    row.amountToPay = amountToPay;
    row.amountToReinvest = max - amountToPay;
    this.addOrUpdateRow(row);
  }

  onAmountToReinvestChange(event: any, row: any): void {
    const max = row.amountToBeDelivered ?? 0;

    let amountToReinvest = Number(event.target.value) || 0;

    // clamp directo
    amountToReinvest = Math.max(0, Math.min(amountToReinvest, max));

    // sync UI + model
    event.target.value = amountToReinvest;

    row.amountToReinvest = amountToReinvest;
    row.amountToPay = max - amountToReinvest;
    this.addOrUpdateRow(row);
  }

  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize);
  }

  processPendingGroups() {
    showGlobalLoader();
    const data = this.rowsSelected.map((row, index) => ({
      amountToBeDelivered: Number(row.amountToBeDelivered),
      amountToPaid: Number(row.amountToPay),
      amountToReinvest: Number(row.amountToReinvest),
      loanId: Number(row.loanId),
      id: Number(row.id)
    }));

    this.organizationService
      .processPendingGroups(data)
      .pipe(
        finalize(() => {
          hideGlobalLoader();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate([
            '/organization',
            'bank-conciliation',
            'payout'
          ]);
        }
      });
  }

  onCancel() {
    this.goToHome();
  }

  goToHome(): void {
    this.showConfirmationDialog = false;

    this.router.navigate([
      '/organization',
      'bank-conciliation',
      'payout'
    ]);
  }

  isRowSelected(row: any): boolean {
    return this.rowsSelected.filter((r) => r.id === row.id).length > 0;
  }

  private addOrUpdateRow(row: any): void {
    const index = this.rowsSelected.findIndex((r) => r.id === row.id);

    if (index === -1) {
      this.rowsSelected.push(row);
    } else {
      this.rowsSelected[index] = row;
    }
    this.includedCount = this.rowsSelected.length;
  }
}
