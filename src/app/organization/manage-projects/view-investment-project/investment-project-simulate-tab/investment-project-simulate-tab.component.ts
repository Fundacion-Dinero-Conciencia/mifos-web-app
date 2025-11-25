import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { SystemService } from 'app/system/system.service';
import { forkJoin } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'mifosx-investment-project-simulate-tab',
  templateUrl: './investment-project-simulate-tab.component.html',
  styleUrls: ['./investment-project-simulate-tab.component.scss']
})
export class InvestmentProjectSimulateTabComponent implements OnInit {
  adicionalForm!: FormGroup;
  selectedCommission: any;
  allowEditingForm: boolean = false;
  filesvg = faFileAlt;
  isEditingSimulation: boolean = false;
  idProject: string | number;
  isFactoring = false;
  investorInterests: any;
  totalCredit: any;
  form!: FormGroup;
  comisiones: MatTableDataSource<any> = new MatTableDataSource();
  commissionTypes: any[] = [];
  commissionToShow: any[] = [];
  commissionAEF: any[] = [];
  displayedColumns: string[] = [
    'Mnemonic',
    'Creation date',
    'Amount to be Financed',
    'Total interest',
    'Total credit',
    'CAE',
    'Rate',
    'Term',
    'Credit Type',
    'showMore'
  ];
  displayedColumnsCommisions: string[] = [
    'commissionType',
    'description',
    'netAmount',
    'vat',
    'total',
    'actions'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  projectData: any;
  loanProductsData: any;
  loanPurposeData: any;
  isCreatingSimulation: boolean = false;
  createForm: UntypedFormGroup;
  loanTemplate: any;
  caeValue: any;
  loanTemplateEdit: any;
  selectedSimulation: any;
  currency: string;
  creditTypesData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private loanService: LoansService,
    private systemService: SystemService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { accountData: any; loanProductsData: any; creditTypesData: any }) => {
      this.projectData = data.accountData;
      this.loanProductsData = data.loanProductsData;
      this.creditTypesData = data.creditTypesData.codeValues;
    });
    this.createForm = this.formBuilder.group({
      basedInLoanProductId: [
        '',
        Validators.required
      ],
      creditTypeId: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ],
      interestRate: [
        '',
        Validators.required
      ],
      period: [
        '',
        Validators.required
      ]
    });
    this.createForm.valueChanges;
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  getLoanPurposeById(id: any) {
    if (!id) {
      return null;
    }

    return this.loanProductsData.find((lp: any) => lp.id === id);
  }

  addQueryParam(id: string | number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { simulation: id },
      queryParamsHandling: 'merge'
    });
  }

  isITESelected(): boolean {
    const commissionId = this.adicionalForm.get('commissionTypeId')?.value;
    const commission = this.commissionToShow.find((c) => c.id === commissionId);
    const ite = commission?.name === 'ITE';
    this.enabledFields(ite);
    return ite;
  }

  enabledFields(flag: boolean) {
    if (flag) {
      this.adicionalForm.get('netAmount')?.disable();
      this.adicionalForm.get('description')?.disable();
      this.adicionalForm.get('vat')?.disable();
    } else {
      this.adicionalForm.get('netAmount')?.enable();
      this.adicionalForm.get('description')?.enable();
      this.adicionalForm.get('vat')?.enable();
    }
  }

  addCommission(): void {
    const formValue = this.adicionalForm.value;
    const otherExpenses = this.getCommissionByName('OTROS GASTOS');
    const vat = Number(formValue.vat ?? this.getIvaVigente());
    const netAMount = Number(formValue.netAmount);
    const total = netAMount + (netAMount * vat) / 100;

    const nuevaComision: any = {
      commissionTypeId: otherExpenses.id,
      commissionType: otherExpenses,
      description: formValue.description,
      netAmount: formValue.netAmount,
      vat: vat,
      total: total
    };

    if (this.selectedCommission) {
      if (this.selectedCommission.id) {
        nuevaComision.id = this.selectedCommission.id;
      } else if (this.selectedCommission.uuid) {
        nuevaComision.uuid = this.selectedCommission.uuid;
      }

      const index = this.comisiones.data.findIndex((c) => {
        if (this.selectedCommission.id) {
          return c.id === this.selectedCommission.id;
        } else if (this.selectedCommission.uuid) {
          return c.uuid === this.selectedCommission.uuid;
        }
        return false;
      });

      if (index !== -1) {
        this.comisiones.data[index] = nuevaComision;
      } else {
        nuevaComision.uuid = uuidv4();
        this.comisiones.data.push(nuevaComision);
      }
    } else {
      nuevaComision.uuid = uuidv4();
      this.comisiones.data.push(nuevaComision);
    }

    this.adicionalForm.reset();
    this.selectedCommission = null;
    this.comisiones._updateChangeSubscription();
    this.getTotalCredit();
  }

  calculatePromissoryNote(percentage: any): number {
    var amount = this.selectedSimulation?.amountToBeFinanced || 0;

    // Buscar comisión AEF
    const aef = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF');
    const montoAEF = aef?.total || 0;
    // Buscar IVA sobre AEF
    const ivaAef = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF');
    const montoIVAAEF = ivaAef?.total || 0;

    // Sumar OTROS GASTOS
    const otrosGastos = this.comisiones.data
      .filter((c) => ['OTROS GASTOS'].includes(c.commissionType?.name?.trim().toUpperCase()))
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    var subtotalAef = montoAEF + montoIVAAEF;

    if (this.isFactoring) {
      const tasaToApply =
        this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.vat / 360; // tasa AEF por mes
      const montoFinanciar = this.getMontoAFinanciar;
      amount = this.updateAmountRequested() || 0;
      subtotalAef = (montoFinanciar * this.selectedSimulation?.period * tasaToApply) / 100;
    }

    const pagaré = (amount + subtotalAef + otrosGastos) / (1 - percentage);
    return pagaré;
  }

  addCommissionITE() {
    const existe = this.comisiones.data.some((x) => x.commissionType?.name?.trim().toUpperCase() === 'ITE');
    if (existe) {
      this.alertService.alert({
        type: 'warning',
        message: this.translateService.instant('errors.error.msg.charge.duplicate.name')
      });
    } else {
      const period = this.isFactoring === true ? this.selectedSimulation?.period / 30 : this.selectedSimulation?.period;
      const tipoITE = this.getCommissionByName('ITE');
      const percentage = this.getPercentageITEAcordingPeriod() / 100;
      const percentageIte = period >= 12 ? percentage : percentage * period + percentage;
      const prommisoryAmount = this.calculatePromissoryNote(percentageIte);
      const total = prommisoryAmount * percentageIte;
      this.comisiones.data.push({
        commissionType: tipoITE,
        description: 'Impuesto de Timbres y Estampillas (ITE)',
        netAmount: prommisoryAmount,
        vat: percentageIte * 100,
        total: total,
        uuid: uuidv4()
      });
    }
    this.getTotalCredit();
  }

  getPercentageITEAcordingPeriod(): number {
    const ite = this.getCommissionByName('ITE');
    const period = this.isFactoring === true ? this.selectedSimulation?.period / 30 : this.selectedSimulation?.period;

    if (!ite?.description || period == null) return null;

    const match = ite.description.match(/([\d.]+)-([\d.]+)/);
    if (!match) return null;

    const lower = parseFloat(match[1]);
    const upper = parseFloat(match[2]);

    return period >= 12 ? upper : lower;
  }

  addCommissionAmountInvoice() {
    const formValue = this.adicionalForm.value;
    const tipoInvoice = this.getCommissionByName('MONTO FACTURA');

    if (!tipoInvoice) {
      return;
    }

    // Buscar si ya existe una comisión "MONTO FACTURA" por id o uuid
    const existingIndex = this.comisiones.data.findIndex(
      (c) => c.commissionType?.id === tipoInvoice.id && (c.id || c.uuid)
    );

    const existing = existingIndex >= 0 ? this.comisiones.data[existingIndex] : null;
    var total = 0;
    if (formValue.vat) {
      total = (formValue.netAmount * formValue.vat) / 100;
    } else {
      total = formValue.netAmount;
    }

    const invoiceCommission: any = {
      commissionTypeId: tipoInvoice.id,
      commissionType: tipoInvoice,
      description: 'Monto de factura (factoring)',
      netAmount: formValue.netAmount,
      vat: formValue.vat,
      total: total
    };

    // Preservar ID si ya existe
    if (existing?.id) {
      invoiceCommission.id = existing.id;
    } else if (existing?.uuid) {
      invoiceCommission.uuid = existing.uuid;
    } else {
      // Solo generar uuid si no hay id ni uuid
      invoiceCommission.uuid = uuidv4();
    }

    if (existingIndex >= 0) {
      this.comisiones.data[existingIndex] = invoiceCommission;
    } else {
      this.comisiones.data.push(invoiceCommission);
    }
    this.comisiones._updateChangeSubscription();
    this.getAdditionalExpensesByProjectId();

    this.adicionalForm.reset();

    this.getTotalCredit();
  }

  calculateCommission(): void {
    const formValue = this.adicionalForm.value;
    const tipo = this.commissionTypes.find((c) => c.id === formValue.commissionTypeId);

    if (tipo.name?.trim().toUpperCase() === 'ITE') {
      this.addCommissionITE();
    } else if (tipo.name?.trim().toUpperCase() === 'OTROS GASTOS') {
      this.addCommission();
    } else if (tipo.name?.trim().toUpperCase() === 'MONTO FACTURA') {
      this.addCommissionAmountInvoice();
    } else if (tipo.name?.trim().toUpperCase() === 'AEF') {
      this.addCommissionAEF(formValue.netAmount, formValue.vat);
    }
    this.comisiones._updateChangeSubscription();
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.adicionalForm.reset();
    this.selectedCommission = null;
  }

  cancelEditingForm() {
    this.createForm.patchValue({
      basedInLoanProductId: this.selectedSimulation.basedInLoanProductId,
      amount: this.projectData.amount || 0,
      creditTypeId: this.selectedSimulation.creditTypeId,
      interestRate: this.selectedSimulation?.rate,
      period: this.selectedSimulation?.period
    });
    this.switchAllowEditing();
  }

  backToTable() {
    this.isEditingSimulation = false;
    this.allowEditingForm = false;
    this.isCreatingSimulation = false;
    this.selectedSimulation = null;
    this.createForm.reset();
    this.createForm.enable();
    this.addQueryParam(0);
  }

  editCommission(commission: any): void {
    this.selectedCommission = commission;
    this.adicionalForm.patchValue({
      commissionTypeId: commission.commissionTypeId,
      commissionType: commission.commissionType,
      netAmount: commission.netAmount,
      vat: commission.vat,
      description: commission.description,
      total: commission.total,
      id: commission.id,
      uuid: commission.uuid
    });
  }

  switchAllowEditing() {
    this.allowEditingForm = !this.allowEditingForm;
    this.createForm.get('basedInLoanProductId').disable();
    if (this.allowEditingForm) {
      this.createForm.enable();
      this.createForm.get('basedInLoanProductId').disable();
      this.createForm.get('creditTypeId').disable();
    } else {
      this.createForm.disable();
    }
  }

  ngOnInit(): void {
    this.adicionalForm = this.fb.group({
      commissionType: [null],
      commissionTypeId: [
        null,
        Validators.required
      ],
      description: [
        '',
        Validators.required
      ],
      netAmount: [
        null,
        [
          Validators.required,
          Validators.min(0)]
      ],
      vat: [null],
      total: [null]
    });
    this.getDefaultCurrency();
    this.organizationService.getSimulations(this.projectData.id).subscribe((response: any) => {
      this.dataSource.data = response || [];
      if (Number(this.route.snapshot.queryParamMap.get('simulation'))) {
        this.switchEditingSimulation({ ...response[0] });
      }
    });
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
  }
  generateSimulationPdf() {
    const payload = { projectId: this.idProject };
    this.organizationService.generateSimulationPdf(payload).subscribe((data: any) => {
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // 2. Crear un objeto URL
      const blobUrl = URL.createObjectURL(blob);

      // 3. Crear un enlace y forzar la descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'SimulacionFinanciamiento.pdf';
      document.body.appendChild(link);
      link.click();

      // 4. Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    });
  }
  switchCreatingSimulation() {
    this.createForm.reset();
    this.createForm.enable();
    this.isCreatingSimulation = !this.isCreatingSimulation;
  }

  setFormValuesToEdit() {
    this.createForm.patchValue({
      basedInLoanProductId: this.selectedSimulation.basedInLoanProductId,
      amount: this.projectData.amount || 0,
      creditTypeId: this.selectedSimulation.creditTypeId,
      interestRate: this.selectedSimulation.rate,
      period: this.selectedSimulation.period
    });
  }

  switchEditingSimulation(row: any) {
    this.selectedSimulation = row;
    this.isCreatingSimulation = !this.isCreatingSimulation;
    this.isEditingSimulation = !this.isEditingSimulation;
    if (this.isEditingSimulation) {
      this.addQueryParam(1);
      this.getLoanTemplate();
    }
    this.setFormValuesToEdit();
    this.createForm.disable();
  }

  get generalPurposeprojectId(): string {
    if (this.projectData.projectGeneralPurposeId) {
      const generalPurpose = this.loanPurposeData.find((purpose: any) => {
        if (purpose.id === this.projectData.projectGeneralPurposeId) {
          return true;
        }
      });
      return generalPurpose ? generalPurpose.id : '';
    } else {
      const noIdea = this.loanPurposeData.find((purpose: any) => {
        if (purpose.name === 'No especificada') {
          return true;
        }
      });
      return noIdea ? noIdea.id : '';
    }
  }

  createSimulation() {
    const payloadJSON = JSON.stringify({ ...this.createForm.value, loanPurposeId: this.generalPurposeprojectId });
    this.organizationService.generateSimulation(this.projectData.id, payloadJSON).subscribe((response: any) => {
      this.alertService.alert({
        type: 'success',
        message: 'Simulaciòn creada con èxito'
      });
      this.organizationService.getSimulations(this.projectData.id).subscribe((response: any) => {
        this.dataSource.data = response || [];
        this.addQueryParam(0);
        window.location.reload();
      });
      this.switchCreatingSimulation();
    });
  }

  deleteCommission(commission: any): void {
    const isAEF =
      commission.commissionType?.name?.trim().toUpperCase() === 'AEF' ||
      commission.commissionType?.name?.trim().toUpperCase() === 'MONTO FACTURA';
    const toDelete: any[] = [];

    // Buscar el IVA-AEF solo si el que se elimina es AEF
    if (isAEF) {
      const ivaAEF = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF');
      if (ivaAEF) {
        toDelete.push(ivaAEF);
      }
      if (commission.commissionType?.name?.trim().toUpperCase() === 'MONTO FACTURA') {
        const AEF = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF');
        if (AEF) {
          toDelete.push(AEF);
        }
      }
    }

    // Agregar el AEF o cualquier otra comisión a eliminar
    toDelete.push(commission);

    // Procesar eliminaciones
    toDelete.forEach((item) => {
      const identifier = item.id ?? item.uuid;

      if (!identifier) return; // No se puede identificar la comisión
      // Eliminar del backend si tiene ID
      if (item.id) {
        this.organizationService.deleteAdditionalExpensesById(item.id, false).subscribe({
          next: () => {
            this.removeCommissionFromTable(item);
            if (item === commission) {
              this.alertService.alert({
                type: 'Success',
                message: this.translateService.instant('labels.inputs.Deleted')
              });
            }
          },
          error: (error) => {
            if (error?.error?.defaultUserMessage) {
              const message = error.error.defaultUserMessage;
              this.alertService.alert({
                type: 'Error',
                message: this.translateService.instant(message)
              });
            }
          }
        });
      } else {
        // Eliminar solo localmente (por UUID)
        this.removeCommissionFromTable(item);
      }
    });

    this.comisiones._updateChangeSubscription();
    this.getTotalCredit();
  }

  private removeCommissionFromTable(commissionToRemove: any): void {
    this.comisiones.data = this.comisiones.data.filter((c) =>
      c.id ? c.id !== commissionToRemove.id : c.uuid !== commissionToRemove.uuid
    );
  }

  sendEdit() {
    const modifiedData = {
      ...this.loanTemplateEdit,
      principal: this.createForm.get('amount').value,
      interestRatePerPeriod: this.createForm.get('interestRate').value,
      numberOfRepayments: this.createForm.get('period').value,
      loanTermFrequency: this.createForm.get('period').value,
      amount: undefined,
      interestRate: undefined,
      period: undefined
    };

    this.loanService.updateLoansAccount(this.projectData?.loanId, modifiedData).subscribe({
      next: (data) => {
        const principal = this.createForm.get('amount').value;
        const numberOfRepayments = this.createForm.get('period').value;
        const interestRatePerPeriod = this.createForm.get('interestRate').value;
        this.submitProjectData(true, principal, interestRatePerPeriod, numberOfRepayments);
        this.alertService.alert({
          type: 'Success',
          message: this.translateService.instant('labels.heading.Saved Successfully')
        });
      },
      error: (err) => {
        console.error('Error update loan:', err);
      }
    });
  }

  submitProjectData(editCredit: boolean, amount?: any, rate?: any, period?: any) {
    var payload: any = {};
    payload.amountToBeFinanced = this.getMontoAFinanciar;
    payload.amountToBeDelivered = this.getMontoAEntregar;
    payload.creditTypeId = this.generalPurposeprojectId;
    payload.projectRate = this.projectData.rate;
    payload.onlyAmounts = true;

    if (amount && amount > 0) {
      payload.amount = amount;
    }
    if (rate && rate > 0) {
      payload.projectRate = rate;
    }
    if (period && period > 0) {
      payload.period = period;
    }

    this.organizationService.updateInvestmentProjectAmounts(this.idProject, payload).subscribe({
      next: (data) => {
        if (editCredit === true) {
          this.organizationService.deleteAdditionalExpensesById(this.idProject as string, true).subscribe({
            next: (dataX) => {
              window.location.reload();
            }
          });
        } else {
          const modifiedData = {
            ...this.loanTemplateEdit,
            submittedOnDate: this.dateUtils.formatDate(
              this.loanTemplate.timeline.expectedDisbursementDate,
              SettingsService.businessDateFormat
            ),
            expectedDisbursementDate: this.dateUtils.formatDate(
              this.loanTemplate.timeline.expectedDisbursementDate,
              SettingsService.businessDateFormat
            ),
            principal: this.getMontoAFinanciar
          };

          this.loanService.updateLoansAccount(this.projectData?.loanId, modifiedData).subscribe({
            next: (data) => {
              this.alertService.alert({
                type: 'Success',
                message: this.translateService.instant('labels.heading.Saved Successfully')
              });
            },
            error: (err) => {
              console.error('Error update loan:', err);
            }
          });
        }
      }
    });
  }

  goToModifyApplication(): void {
    const clientId = this.projectData?.ownerId;
    const loanId = this.projectData?.loanId;

    this.router.navigate([
      '/clients',
      clientId,
      'loans-accounts',
      loanId,
      'edit-loans-account'
    ]);
  }

  editSimulation() {
    const payloadJSON = JSON.stringify({ ...this.createForm.value, loanPurposeId: this.generalPurposeprojectId });
    this.organizationService.generateSimulation(this.projectData.id, payloadJSON).subscribe((response: any) => {
      this.alertService.alert({
        type: 'success',
        message: 'Simulaciòn creada con èxito'
      });
      this.organizationService.getSimulations(this.projectData.id).subscribe((response: any) => {
        this.dataSource.data = response || [];
        this.selectedSimulation = { ...response[0] };
      });
    });
  }

  saveCommissions(): void {
    const payload = this.comisiones.data.map((c) => ({
      projectId: this.projectData.id,
      commissionTypeId: c.commissionType.id,
      description: c.description,
      netAmount: c.netAmount,
      vat: c.vat,
      total: c.total,
      id: c.id
    }));
    this.organizationService.saveAdditionalExpenses(payload).subscribe((data) => {
      const principal = this.createForm.get('amount').value;
      const numberOfRepayments = this.createForm.get('period').value;
      const interestRatePerPeriod = this.createForm.get('interestRate').value;
      this.submitProjectData(false, principal, interestRatePerPeriod, numberOfRepayments);
      window.location.reload();
    });
  }

  submitCommisions() {
    const warningtDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Approve Share'),
        dialogContext: this.translateService.instant('labels.text.Are you sure you want to save commisions not edit'),
        type: 'Mild'
      }
    });
    warningtDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.saveCommissions();
      }
    });
  }

  updateAmountRequested() {
    const existInvoice = this.comisiones.data.find((c) => c.commissionType?.name === 'MONTO FACTURA');
    if (existInvoice) {
      return existInvoice.total;
    }
  }

  getCaeValue(): number {
    return this.caeValue;
  }

  get getMontoAFinanciar(): number {
    const montoAFinanciar = this.createForm.value.amount;
    const aef = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.total || 0;
    const ivaAef =
      this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF')?.total || 0;
    const otrosGastos = this.comisiones.data
      .filter((c) => [
          'OTROS GASTOS'
        ].includes(c.commissionType?.name?.trim().toUpperCase()))
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const ite = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'ITE')?.total || 0;

    if (this.isFactoring) {
      // const amountInvoice =
      //   this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'MONTO FACTURA')?.total || 0;
      // return amountInvoice + aef + ivaAef + otrosGastos;
      return this.updateAmountRequested();
    }
    return montoAFinanciar + aef + ivaAef + otrosGastos + ite;
  }

  get getMontoAEntregar(): number {
    const period = this.createForm.value.period || this.projectData?.period;
    const rate = this.createForm.value.interestRate || this.projectData?.rate;
    const amount = this.createForm.value.amount || this.projectData?.amount || 0;
    if (this.isFactoring) {
      const tasaToApply =
        this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.vat / 360;
      const montoFinanciar = this.getMontoAFinanciar;
      const subtotalAef = (montoFinanciar * period * tasaToApply) / 100;
      this.investorInterests = montoFinanciar * (rate / 360 / 100) * period;
      const ite = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'ITE')?.total || 0;
      return montoFinanciar - subtotalAef - ite - this.investorInterests;
    }
    return amount;
  }

  loadingCommissions = false; //

  loadTypesCommissions(): void {
    this.loadingCommissions = true; //

    // Primer paso: obtener CONFIG_COMMISSION_TAXES
    this.systemService
      .getCodeByName('CONFIG_COMMISSION_TAXES')
      .pipe(
        map((data) => {
          this.commissionTypes = data?.codeValues?.filter((cv: any) => cv.active) || [];

          this.commissionToShow = this.commissionTypes.filter((cv: any) => [
              'OTROS GASTOS',
              'ITE',
              this.isFactoring === true ? 'MONTO FACTURA' : ''
            ].includes(cv.name?.trim().toUpperCase()));

          return true;
        }),
        // Segundo paso: obtener COMMISSION_AEF
        switchMap(() => this.systemService.getCodeByName('COMMISSION_AEF')),
        map((data) => {
          this.commissionAEF = data?.codeValues?.filter((cv: any) => cv.active) || [];
        }),
        // Tercer paso: cuando las dos peticiones terminen, ejecutar en paralelo los métodos dependientes
        switchMap(() =>
          forkJoin([
            this.organizationService.getAdditionalExpensesByProjectId(this.projectData.id),
            this.loanService.getLoansAccountAndTemplateResource(this.projectData?.loanId)])
        ),
        finalize(() => {
          this.loadingCommissions = false; // ✅ termina loading siempre
        })
      )
      .subscribe({
        next: ([
          additionalExpenses,
          loanTemplateEdit
        ]) => {
          // Procesar los resultados una vez todo haya cargado
          this.processAdditionalExpenses(additionalExpenses);
          this.loanTemplateEdit = this.buildLoanTemplateEdit(loanTemplateEdit);

          this.getMontoAEntregar;
          this.getTotalCredit();
        },
        error: (err) => {
          console.error('Error cargando comisiones:', err);
          this.loadingCommissions = false;
        }
      });
  }

  private processAdditionalExpenses(data: any): void {
    if (data && Array.isArray(data)) {
      const enriched = data.map((item) => {
        const tipo = this.commissionTypes.find((c) => c.id === item.commissionTypeId);
        return { ...item, id: item.id, commissionType: tipo };
      });
      if (enriched.length > 0) {
        this.comisiones.data = enriched;
      }

      const existeAEF = enriched.some((item) => item.commissionType?.name === 'AEF');
      if (!existeAEF) {
        this.addCommissionAEF(null, null);
      }
    } else {
      this.addCommissionAEF(null, null);
    }

    this.getTotalCredit();
  }

  private buildLoanTemplateEdit(data: any): any {
    return {
      productId: data.product.id,
      submittedOnDate: this.dateUtils.formatDate(
        data.timeline.expectedDisbursementDate,
        SettingsService.businessDateFormat
      ),
      expectedDisbursementDate: this.dateUtils.formatDate(
        data.timeline.expectedDisbursementDate,
        SettingsService.businessDateFormat
      ),
      loanTermFrequency: data.termFrequency,
      loanTermFrequencyType: data.termPeriodFrequencyType.id,
      numberOfRepayments: data.numberOfRepayments,
      repaymentEvery: data.repaymentEvery,
      repaymentFrequencyType: data.repaymentFrequencyType.id,
      interestType: data.interestType.id,
      isEqualAmortization: data.isEqualAmortization,
      amortizationType: data.amortizationType.id,
      interestCalculationPeriodType: data.interestCalculationPeriodType.id,
      graceOnArrearsAgeing: data.graceOnArrearsAgeing,
      transactionProcessingStrategyCode: data.transactionProcessingStrategyCode,
      interestRateFrequencyType: data.interestRateFrequencyType.id,
      interestRatePerPeriod: data.interestRatePerPeriod,
      enableInstallmentLevelDelinquency: data.enableInstallmentLevelDelinquency,
      charges: data.charges || [],
      collateral: data.collateral || [],
      disbursementData: data.disbursementData || [],
      clientId: data.clientId,
      dateFormat: SettingsService.businessDateFormat,
      locale: this.settingsService.language.code,
      loanType: data?.loanType?.value.toLowerCase(),
      principal: data.principal,
      allowPartialPeriodInterestCalcualtion: data.allowPartialPeriodInterestCalculation
    };
  }

  getDataForEditLoan() {
    this.loanService.getLoansAccountAndTemplateResource(this.projectData?.loanId).subscribe((data: any) => {
      this.loanTemplateEdit = {
        productId: data.product.id,
        submittedOnDate: this.dateUtils.formatDate(
          data.timeline.expectedDisbursementDate,
          SettingsService.businessDateFormat
        ),
        expectedDisbursementDate: this.dateUtils.formatDate(
          data.timeline.expectedDisbursementDate,
          SettingsService.businessDateFormat
        ),
        linkAccountId: '',
        createStandingInstructionAtDisbursement: '',
        loanTermFrequency: data.termFrequency,
        loanTermFrequencyType: data.termPeriodFrequencyType.id,
        numberOfRepayments: data.numberOfRepayments,
        repaymentEvery: data.repaymentEvery,
        repaymentFrequencyType: data.repaymentFrequencyType.id,
        repaymentFrequencyNthDayType: '',
        repaymentFrequencyDayOfWeekType: '',
        repaymentsStartingFromDate: null,
        interestChargedFromDate: null,
        interestType: data.interestType.id,
        isEqualAmortization: data.isEqualAmortization,
        amortizationType: data.amortizationType.id,
        interestCalculationPeriodType: data.interestCalculationPeriodType.id,
        graceOnArrearsAgeing: data.graceOnArrearsAgeing,
        loanIdToClose: '',
        isTopup: '',
        transactionProcessingStrategyCode: data.transactionProcessingStrategyCode,
        interestRateFrequencyType: data.interestRateFrequencyType.id,
        interestRatePerPeriod: this.createForm.value.period || data.interestRatePerPeriod,
        enableInstallmentLevelDelinquency: data.enableInstallmentLevelDelinquency,
        charges: data.charges || [],
        collateral: data.collateral || [],
        disbursementData: data.disbursementData || [],
        clientId: data.clientId,
        dateFormat: SettingsService.businessDateFormat,
        locale: this.settingsService.language.code,
        loanType: data?.loanType?.value.toLowerCase(),
        principal: data.principal,
        allowPartialPeriodInterestCalcualtion: data.allowPartialPeriodInterestCalculation
      };
      this.createFormLoan();
    });
  }

  createFormLoan() {
    this.form = this.fb.group({
      principal: [
        this.projectData?.amount,
        Validators.required
      ],
      numberOfRepayments: [
        this.projectData?.period,
        Validators.required
      ],
      loanTermFrequency: [
        this.projectData?.period,
        Validators.required
      ],
      interestRatePerPeriod: [
        this.projectData?.rate,
        Validators.required
      ]
    });
  }

  getCommissionAcordingByPeriod(): number | null {
    const period = this.isFactoring ? this.selectedSimulation?.period / 30 : this.selectedSimulation?.period;
    if (period == null || !this.commissionAEF?.length) return null;

    const activeCommissions = this.commissionAEF.filter((item) => item.active);

    for (const item of activeCommissions) {
      const name = item.name?.trim();
      if (!name) continue;

      const match = name.match(/(\d+)\s*a\s*(\d+)|(\d+)\s*o\s*m[aá]s/i);
      if (match) {
        let min: number;
        let max: number;

        if (match[1] && match[2]) {
          min = parseInt(match[1], 10);
          max = parseInt(match[2], 10);
        } else if (match[3]) {
          min = parseInt(match[3], 10);
          max = Infinity;
        } else {
          continue;
        }

        if (period >= min && period <= max) {
          return parseFloat(item.description);
        }
      }
    }
    return null;
  }

  validateExistCommission(name: string): boolean {
    return this.comisiones.data.some((c) => c.commissionType?.name === name);
  }

  getIvaVigente(): number {
    const ivaItem = this.commissionTypes.find((t) => t.name?.trim().toLowerCase() === 'iva');
    return parseFloat(ivaItem.description);
  }

  getCommissionByName(nombre: string): any {
    return this.commissionTypes.find((t) => t.name?.trim().toLowerCase() === nombre.toLowerCase());
  }

  addCommissionAEF(baseAmount: number, percentage: number): void {
    let montoSolicitado = baseAmount || this.selectedSimulation.amountToBeFinanced;
    const tasaAEF = percentage || this.getCommissionAcordingByPeriod();
    var tasaToApply = 0;
    if (this.isFactoring === true) {
      tasaToApply = tasaAEF / 360;

      if (this.validateExistCommission('MONTO FACTURA')) {
        montoSolicitado = this.updateAmountRequested();
      } else {
        return;
      }
    } else {
      tasaToApply = tasaAEF / 12;
    }

    const period = this.selectedSimulation?.period;

    var montoAEF = null;
    var ivaAEF = null;
    if (this.isFactoring) {
      const subtotalAef = (montoSolicitado * period * tasaToApply) / 100;
      montoAEF = subtotalAef / (1 + this.getIvaVigente() / 100);
      ivaAEF = subtotalAef - montoAEF;
    } else {
      montoAEF = (montoSolicitado * tasaToApply * period) / 100;
      ivaAEF = (montoAEF * this.getIvaVigente()) / 100;
    }

    const tipoAEF = this.getCommissionByName('AEF');
    const tipoIVAAEF = this.getCommissionByName('IVA-AEF');

    if (tipoAEF) {
      const indexAEF = this.comisiones.data.findIndex((c) => c.commissionType?.id === tipoAEF.id);

      const existingAEF = indexAEF >= 0 ? this.comisiones.data[indexAEF] : null;

      const aefCommission = {
        ...(existingAEF?.id && { id: existingAEF.id }),
        ...(existingAEF?.uuid && { uuid: existingAEF.uuid }),
        commissionTypeId: tipoAEF.id,
        commissionType: tipoAEF,
        description: 'Comisión por Asesoría de Estructuración Financiera (AEF)',
        netAmount: montoSolicitado,
        vat: tasaAEF,
        total: montoAEF
      };

      if (!aefCommission.id && !aefCommission.uuid) {
        aefCommission.uuid = uuidv4();
      }

      if (indexAEF >= 0) {
        this.comisiones.data[indexAEF] = aefCommission;
      } else {
        this.comisiones.data.push(aefCommission);
      }
    }

    if (tipoIVAAEF) {
      const indexIVAAEF = this.comisiones.data.findIndex((c) => c.commissionType?.id === tipoIVAAEF.id);

      const existingIVAAEF = indexIVAAEF >= 0 ? this.comisiones.data[indexIVAAEF] : null;

      const ivaCommission = {
        ...(existingIVAAEF?.id && { id: existingIVAAEF.id }),
        ...(existingIVAAEF?.uuid && { uuid: existingIVAAEF.uuid }),
        commissionTypeId: tipoIVAAEF.id,
        commissionType: tipoIVAAEF,
        description: 'IVA sobre AEF',
        netAmount: montoAEF,
        vat: this.getIvaVigente(),
        total: ivaAEF
      };

      if (!ivaCommission.id && !ivaCommission.uuid) {
        ivaCommission.uuid = uuidv4();
      }

      if (indexIVAAEF >= 0) {
        this.comisiones.data[indexIVAAEF] = ivaCommission;
      } else {
        this.comisiones.data.push(ivaCommission);
      }
    }
    this.getTotalCredit();
    this.comisiones._updateChangeSubscription();
  }

  getAdditionalExpensesByProjectId(): void {
    this.organizationService.getAdditionalExpensesByProjectId(this.projectData.id).subscribe((data) => {
      if (data && Array.isArray(data)) {
        // si no hay data o no existen las comisiones las carga
        const enriched = data.map((item) => {
          const tipo = this.commissionTypes.find((c) => c.id === item.commissionTypeId);
          return {
            ...item,
            id: item.id,
            commissionType: tipo
          };
        });
        if (enriched.length > 0) {
          this.comisiones.data = enriched;
        }

        const existeAEF = enriched.some((item) => item.commissionType?.name === 'AEF');
        if (!existeAEF) {
          this.addCommissionAEF(null, null);
        }
      } else {
        this.addCommissionAEF(null, null);
      }
      this.getTotalCredit();
    });
  }

  getCAE(periods?: any) {
    const installments = periods ? periods : this.loanTemplate?.repaymentSchedule?.periods;
    const cashFlows: number[] = [];
    cashFlows.push(-installments[0].principalDisbursed);

    for (let i = 1; i < installments.length; i++) {
      const p = installments[i];
      const payment = p.totalInstallmentAmountForPeriod ?? 0;
      cashFlows.push(payment);
    }

    this.organizationService.getCae(cashFlows).subscribe((data) => {
      this.caeValue = data;
      this.caeValue = this.caeValue;
    });
  }

  getTotalCredit() {
    const montoFinanciar = this.getMontoAFinanciar;
    const extractDate = (arr: any): string => {
      if (!arr || arr.length !== 3) return '';

      const [
        year,
        month,
        day
      ] = arr;
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };

    const payload = {
      clientId: this.projectData?.ownerId,
      loanId: this.projectData?.loanId,
      principal: montoFinanciar,
      submittedOnDate: extractDate(this.loanTemplate.timeline?.submittedOnDate),
      expectedDisbursementDate: extractDate(this.loanTemplate.timeline?.expectedDisbursementDate),
      loanTermFrequency: this.loanTemplate?.termFrequency,
      loanTermFrequencyType: this.loanTemplate?.termPeriodFrequencyType?.id,
      numberOfRepayments: this.loanTemplate?.numberOfRepayments,
      repaymentEvery: this.loanTemplate?.repaymentEvery,
      repaymentFrequencyType: this.loanTemplate?.repaymentFrequencyType?.id,
      interestType: this.loanTemplate?.interestType?.id,
      isEqualAmortization: this.loanTemplate?.isEqualAmortization,
      amortizationType: this.loanTemplate?.amortizationType?.id,
      interestCalculationPeriodType: this.loanTemplate?.interestCalculationPeriodType?.id,
      graceOnPrincipalPayment: this.loanTemplate?.graceOnPrincipalPayment,
      graceOnArrearsAgeing: this.loanTemplate?.graceOnArrearsAgeing,
      transactionProcessingStrategyCode: this.loanTemplate?.transactionProcessingStrategyCode,
      interestRateFrequencyType: this.loanTemplate?.interestRateFrequencyType?.id,
      interestRatePerPeriod: this.loanTemplate?.interestRatePerPeriod,
      allowPartialPeriodInterestCalcualtion: this.loanTemplate?.allowPartialPeriodInterestCalcualtion,
      charges: [] as any[],
      collateral: [] as any[],
      disbursementData: [] as any[],
      dateFormat: Dates.DEFAULT_DATEFORMAT,
      locale: this.settingsService.language.code,
      loanType: this.loanTemplate?.loanType?.value.toLowerCase()
    };
    if (montoFinanciar > 0) {
      this.loanService.calculateLoanSchedule(payload).subscribe((data: any) => {
        this.getMontoAEntregar;
        this.totalCredit = Math.round(data.totalRepaymentExpected);
        this.investorInterests = Math.round(data.totalInterestCharged);
        this.getCAE(data.periods);
      });
    }
  }

  getLoanTemplate() {
    this.loadingCommissions = true;
    this.loanService.getLoanAccountAssociationDetails(this.projectData.loanId).subscribe((data) => {
      this.loanTemplate = data;
      this.isFactoring = this.loanTemplate?.shortName === 'FACT';
      this.loadTypesCommissions();
      this.getTotalCredit();
    });
  }
}
