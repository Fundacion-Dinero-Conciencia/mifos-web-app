import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { showGlobalLoader, hideGlobalLoader } from 'app/shared/helpers/loaders';
import { SystemService } from 'app/system/system.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mifosx-payin-transfers',
  templateUrl: './payin-transfers.component.html',
  styleUrls: ['./payin-transfers.component.scss']
})
export class PayinTransfersComponent implements OnInit {
  currency = 'CLP';
  clientType = '';
  detailedRow: any = null;
  isDebtorDetail = false;
  availableItems: any[] = [];
  selectorsGroup: any[] = [];
  inputsGroup: any[];
  assignDataSource = new MatTableDataSource<any>([]);
  isconfirming = false;
  selectedParticipationIds: number[] = [];
  modifiedItemsCount = 0;
  returnReason = '';
  returnAmount = 0;
  showConfirmationDialog = false;
  showSuccessDialog = false;

  assignDisplayedColumns: string[] = [
    'proyect',
    'creditStatus',
    'periodDate',
    'totalDueAmount',
    'periodsInArrears',
    'daysInArrears',
    'fromDate',
    'amounts'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private systemService: SystemService
  ) {}

  ngOnInit(): void {
    this.detailedRow = history.state?.row;

    if (!this.detailedRow) {
      console.log('Redirecting, row state is mandatory');

      this.goToHome();
      return;
    }

    this.clientType = this.detailedRow.clientType?.name;

    if (this.clientType.includes('Crédito')) {
      this.viewAssignationDebtor(this.detailedRow);
    } else {
      this.viewAssignation(this.detailedRow);
    }
  }

  goToHome(): void {
    this.showSuccessDialog = false;

    this.router.navigate([
      '/organization',
      'bank-conciliation',
      'Payin'
    ]);
  }

  getValuesConciliation(): number[] {
    if (!this.inputsGroup) {
      return [];
    }
    return [...this.inputsGroup];
  }

  getTotalAssignedAmount(): number {
    return this.availableItems.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  }

  get totalAssignedAmount(): number {
    const tableAmount = this.availableItems.reduce((total, item) => total + (Number(item.amount) || 0), 0);

    return tableAmount + (Number(this.returnAmount) || 0);
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
          this.availableItems = loanData.map((item: any) => ({
            ...item,
            amount: null
          }));
        },
        error: (error) => {
          console.error(error);
        }
      });

    this.detailedRow = row;
    this.isDebtorDetail = true;
    this.selectorsGroup = [undefined];
    this.inputsGroup = [0];
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
          this.availableItems = data.map((item: any) => ({
            ...item,
            amount: null
          }));

          this.isDebtorDetail = false;
          this.detailedRow = row;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  onAmountInput(row: any): void {
    if (row.amount === '' || row.amount === null || row.amount === undefined) {
      row.amount = null;
    } else {
      row.amount = Number(row.amount);
    }

    this.modifiedItemsCount = this.availableItems.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  }

  hasAssignedAmount(row: any): boolean {
    return row.amount !== null && row.amount !== undefined && row.amount !== '' && Number(row.amount) > 0;
  }

  onReturnAmountChange(): void {
    this.returnAmount = Number(this.returnAmount) || 0;
  }

  onCancel() {
    this.goToHome();
  }

  assignPayingById(id: string): void {
    let listPayload: any[] = [];

    if (this.isDebtorDetail) {
      listPayload = this.availableItems
        .filter((item) => Number(item.amount) > 0)
        .map((item) => ({
          loanId: item.loanId,
          amount: Number(item.amount),
          participationId: undefined
        }));
    } else {
      listPayload = this.availableItems
        .filter((item) => Number(item.amount) > 0)
        .map((item) => ({
          loanId: undefined,
          amount: Number(item.amount),
          participationId: item.id
        }));
    }

    if (this.returnAmount && this.returnAmount > 0) {
      listPayload.push({
        loanId: undefined,
        participationId: undefined,
        amount: this.returnAmount,
        refund: true
      });
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
          this.showConfirmationDialog = false;
          this.showSuccessDialog = true;
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  get creditAssignedAmount(): number {
    return this.totalAssignedAmount - (Number(this.returnAmount) || 0);
  }
}
