import { Component, Inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  UntypedFormBuilder,
  UntypedFormGroup,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';
import { ClientsService } from 'app/clients/clients.service';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { OrganizationService } from '../organization.service';
import { SavingsService } from 'app/savings/savings.service';

@Component({
  selector: 'mifosx-select-dialog',
  templateUrl: './select-dialog.component.html',
  styleUrls: ['./select-dialog.component.scss']
})
export class SelectDialogComponent implements OnInit {
  fromAccountData: any;
  /** Standing Instructions Data */
  accountTransferTemplateData: any;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Edit Standing Instructions form. */
  makeAccountTransferForm: UntypedFormGroup;
  /** To Office Type Data */
  toOfficeTypeData: any;
  /** To Account Type Data */
  toAccountTypeData: any;
  /** To Account Data */
  toAccountData: any;
  /** Account Type Id */
  accountTypeId: number = 2;

  isInvestment: boolean = true;
  staffData: any;
  statusEmployees = 'active';
  searchTerm: string = '';
  filteredStaffData: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    private accountTransfersService: AccountTransfersService,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private clientsService: ClientsService,
    private orgService: OrganizationService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.maxDate = this.settingsService.businessDate;
    this.getTemplateAccountTransfer();
    this.getEmployyesActive();
    this.createMakeAccountTransferForm();
  }

  getTemplateAccountTransfer() {
    this.clientsService.getClientAccountData(this.data.participantId).subscribe((response) => {
      const data: any = response;
      this.fromAccountData = data?.savingsAccounts.find(
        (account: { status: { active: boolean } }) => account.status?.active === true
      );
    });

    this.clientsService.getClientAccountData(this.data.project.ownerId).subscribe((response) => {
      const data: any = response;
      this.toAccountData = data?.savingsAccounts.filter(
        (account: { status: { approved: boolean; submittedAndPendingApproval: boolean } }) =>
          account.status?.approved === true || account.status?.submittedAndPendingApproval === true
      );
    });

    this.accountTransfersService
      .newAccountTranferResource(this.data.project.ownerId, this.accountTypeId)
      .subscribe((response) => {
        this.accountTransferTemplateData = response;
        this.setOptions();
      });
  }

  getEmployyesActive() {
    this.orgService.getEmployeesByStatus(this.statusEmployees).subscribe(
      (response) => {
        this.staffData = response;
      },
      (error) => {
        this.alertService.alert({
          type: 'Resource does not exist',
          message: 'Error obteniendo la lista de empleados'
        });
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.makeAccountTransferForm.valid) {
      const formValues = this.makeAccountTransferForm.value;

      const transferPayload = {
        toAccountId: formValues.toAccountId,
        toClientId: this.data?.project?.ownerId,
        toAccountType: this.accountTypeId,
        toOfficeId: formValues.toOfficeId,

        transferAmount: formValues.transferAmount,
        transferDate: this.dateUtils.formatDate(formValues.transferDate, this.settingsService.dateFormat),
        transferDescription: formValues.transferDescription,
        dateFormat: this.settingsService.dateFormat,
        locale: this.settingsService.language.code,
        isInvestment: true,
        percentageInvestmentAgent: formValues.percentageInvestmentAgent,
        investmentAgentId: formValues.investmentAgentId,

        fromAccountId: this.fromAccountData?.id,
        fromClientId: this.data.participantId,
        fromAccountType: this.accountTypeId,
        fromOfficeId: this.accountTransferTemplateData?.fromOffice?.id
      };
      this.dialogRef.close(transferPayload);
    }
  }

  /**
   * Creates the standing instruction form.
   */
  createMakeAccountTransferForm() {
    this.makeAccountTransferForm = this.formBuilder.group({
      toOfficeId: [
        '',
        Validators.required
      ],
      toAccountId: [
        '',
        Validators.required
      ],
      transferAmount: [
        '',
        [
          Validators.required,
          Validators.min(0.01)]
      ],
      transferDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transferDescription: [
        '',
        Validators.required
      ],
      isInvestment: [true],
      percentageInvestmentAgent: [
        ''
      ],
      investmentAgentId: [
        ''
      ]
    });
  }

  /** Sets options value */
  setOptions() {
    this.toOfficeTypeData = this.accountTransferTemplateData.toOfficeOptions;
    this.toAccountTypeData = this.accountTransferTemplateData.toAccountTypeOptions;
  }

  /** Executes on change of various select options */
  changeEvent() {}

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  filterStaff() {
    this.filteredStaffData = this.staffData.filter((staff: { displayName: string }) =>
      staff.displayName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  stopClosing(event: KeyboardEvent) {
    event.stopPropagation();
  }
}
