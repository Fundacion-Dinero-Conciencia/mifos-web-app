import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SystemService } from 'app/system/system.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'mifosx-investment-project-commission-tab',
  templateUrl: './investment-project-commission-tab.component.html',
  styleUrls: ['./investment-project-commission-tab.component.css']
})
export class InvestmentProjectCommissionTabComponent implements OnInit {
  isFactoring = false;
  investorInterests: any;
  totalCredit: any;
  amountToFinance: any;
  amountToRequested: any;
  editLoanEnabled = false;
  loanTemplateEdit: any;
  form!: FormGroup;
  caeValue: any;
  loanTemplate: any;
  selectedCommission: any = null;
  currency: any;
  adicionalForm!: FormGroup;
  projectData: any;
  commissionTypes: any[] = [];
  commissionToShow: any[] = [];
  commissionAEF: any[] = [];
  idProject: any;
  investmentProjectForm: UntypedFormGroup;
  comisiones: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = [
    'commissionType',
    'description',
    'netAmount',
    'vat',
    'total',
    'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private alertService: AlertService,
    private loanService: LoansService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private formBuilder: UntypedFormBuilder
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }

  ngOnInit(): void {
    this.getDefaultCurrency();
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
    this.getLoanTemplate();

    //Project
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
    this.setupInvestmentProjectForm(this.idProject);
  }

  loadTypesCommissions(): void {
    this.systemService.getCodeByName('CONFIG_COMMISSION_TAXES').subscribe((data) => {
      this.commissionTypes = data?.codeValues?.filter((cv: any) => cv.active);
      this.commissionToShow = this.commissionTypes.filter((cv: any) => [
          'OTROS GASTOS',
          'ITE',
          this.isFactoring === true ? 'MONTO FACTURA' : ''
        ].includes(cv.name?.trim().toUpperCase()));
      this.systemService.getCodeByName('COMMISSION_AEF').subscribe((data) => {
        this.commissionAEF = data?.codeValues?.filter((cv: any) => cv.active);
        this.getAdditionalExpensesByProjectId();
        this.getMontoAEntregar();
      });
    });
    this.getDataForEditLoan();
  }

  async setupInvestmentProjectForm(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.organizationService.getInvestmentProject(id).subscribe({
        next: (data) => {
          this.projectData = data;

          this.investmentProjectForm = this.formBuilder.group({
            name: [
              data.name,
              Validators.required
            ],
            subtitle: [
              data.subtitle,
              Validators.required
            ],
            mnemonic: [
              data.mnemonic,
              Validators.required
            ],
            impactDescription: [
              data.impactDescription,
              Validators.required
            ],
            institutionDescription: [
              data.institutionDescription,
              Validators.required
            ],
            teamDescription: [
              data.teamDescription,
              Validators.required
            ],
            financingDescription: [
              data.financingDescription,
              Validators.required
            ],
            littleSocioEnvironmentalDescription: [
              data.littleSocioEnvironmentalDescription,
              Validators.required
            ],
            detailedSocioEnvironmentalDescription: [
              data.detailedSocioEnvironmentalDescription,
              Validators.required
            ],
            maxAmount: [
              data.maxAmount,
              Validators.required
            ],
            minAmount: [
              data.minAmount,
              Validators.required
            ],
            projectRate: [
              data.rate,
              Validators.required
            ],
            position: [
              data.position,
              Validators.required
            ],
            categoryId: [
              data.category.id,
              Validators.required
            ],
            subCategories: [
              data.subCategories?.map((o: any) => o.id) || [],
              Validators.required
            ],
            areaId: [
              data.area.id,
              Validators.required
            ],
            objectives: [
              data.objectives?.map((o: any) => o.id) || [],
              Validators.required
            ],
            isActive: [data.isActive],
            statusId: [
              data.status?.statusValue?.id,
              Validators.required
            ]
          });

          resolve();
        },
        error: (err) => {
          console.error('Error al obtener el proyecto', err);
          reject(err);
        }
      });
    });
  }

  getIvaVigente(): number {
    const ivaItem = this.commissionTypes.find((t) => t.name?.trim().toLowerCase() === 'iva');
    return parseFloat(ivaItem.description);
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

  addCommissionAEF(baseAmount: number, percentage: number): void {
    const montoSolicitado = baseAmount || this.projectData?.amount;
    const tasaAEF = percentage || this.getCommissionAcordingByPeriod();
    var tasaToApply = 0;
    if (this.isFactoring === true) {
      tasaToApply = tasaAEF / 360;
    } else {
      tasaToApply = tasaAEF / 12;
    }

    const period = this.projectData?.period;

    const montoAEF = (montoSolicitado * tasaToApply * period) / 100;
    const ivaAEF = (montoAEF * this.getIvaVigente()) / 100;

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

      if (indexIVAAEF >= 0) {
        this.comisiones.data[indexIVAAEF] = ivaCommission;
      } else {
        this.comisiones.data.push(ivaCommission);
      }
    }
    this.getTotalCredit();
    this.comisiones._updateChangeSubscription();
  }

  addCommissionITE() {
    const existe = this.comisiones.data.some((x) => x.commissionType?.name?.trim().toUpperCase() === 'ITE');
    if (existe) {
      this.alertService.alert({
        type: 'warning',
        message: this.translateService.instant('errors.error.msg.charge.duplicate.name')
      });
    } else {
      const period = this.isFactoring === true ? this.projectData?.period / 30 : this.projectData?.period;
      const tipoITE = this.getCommissionByName('ITE');
      const percentage = this.getPercentageITEAcordingPeriod() / 100;
      const prommisoryAmount = this.calculatePromissoryNote(percentage);
      const total = period >= 12 ? prommisoryAmount * percentage : prommisoryAmount * (percentage + percentage);
      this.comisiones.data.push({
        commissionType: tipoITE,
        description: 'Impuesto de Timbres y Estampillas (ITE)',
        netAmount: prommisoryAmount,
        vat: percentage,
        total: total,
        uuid: uuidv4()
      });
    }
    this.getTotalCredit();
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

    this.adicionalForm.reset();
    this.comisiones._updateChangeSubscription();
    this.getTotalCredit();
  }

  getPercentageITEAcordingPeriod(): number {
    const ite = this.getCommissionByName('ITE');
    const period = this.isFactoring === true ? this.projectData?.period / 30 : this.projectData?.period;

    if (!ite?.description || period == null) return null;

    const match = ite.description.match(/([\d.]+)-([\d.]+)/);
    if (!match) return null;

    const lower = parseFloat(match[1]);
    const upper = parseFloat(match[2]);

    return period >= 12 ? upper : lower;
  }

  calculatePromissoryNote(percentage: any): number {
    const amount = this.projectData?.amount || 0;
    const period = this.isFactoring === true ? this.projectData?.period / 30 : this.projectData?.period;

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

    const pagaré =
      (amount + montoAEF + montoIVAAEF + otrosGastos) / (1 - (period >= 12 ? percentage : percentage + percentage));
    return pagaré;
  }

  getCommissionByName(nombre: string): any {
    return this.commissionTypes.find((t) => t.name?.trim().toLowerCase() === nombre.toLowerCase());
  }

  getCommissionAcordingByPeriod(): number | null {
    const period = this.isFactoring ? this.projectData?.period / 30 : this.projectData?.period;
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
      this.router.navigate(['../'], { relativeTo: this.route });
    });
    this.submitProjectData(false);
  }

  submitProjectData(editCredit: boolean, amount?: any, rate?: any, period?: any) {
    const payload = {
      ...this.investmentProjectForm.getRawValue()
    };
    if (editCredit === false) {
      payload['amountToBeFinanced'] = this.getMontoAFinanciar();
      payload['amountToBeDelivered'] = this.getMontoAEntregar();
    }
    payload['subCategories'] = JSON.stringify(payload['subCategories']);
    payload['objectives'] = JSON.stringify(payload['objectives']);

    if (amount && amount > 0) {
      payload['amount'] = amount;
    }
    if (rate && rate > 0) {
      payload['projectRate'] = rate;
    }
    if (period && period > 0) {
      payload['period'] = period;
    }

    this.organizationService.updateInvestmentProjects(this.idProject, payload).subscribe({
      next: (data) => {
        if (editCredit === true) {
          this.organizationService.deleteAdditionalExpensesById(this.idProject, true).subscribe({
            next: (dataX) => {
              this.router.navigate(['../'], { relativeTo: this.route });
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
            principal: this.getMontoAFinanciar()
          };

          this.loanService.updateLoansAccount(this.projectData?.loanId, modifiedData).subscribe({
            next: (data) => {
              this.alertService.alert({
                type: 'Success',
                message: this.translateService.instant('labels.heading.Saved Successfully')
              });
              this.reload();
            },
            error: (err) => {
              console.error('Error update loan:', err);
            }
          });
        }
      }
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
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

  submit() {
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

  getMontoAFinanciar(): number {
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
      const amountInvoice =
        this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'MONTO FACTURA')?.total || 0;
      return amountInvoice + aef + ivaAef + otrosGastos;
    }

    return (this.projectData?.amount || 0) + aef + ivaAef + otrosGastos + ite;
  }

  getMontoAEntregar(): number {
    if (this.isFactoring) {
      const montoFinanciar = this.getMontoAFinanciar();
      const aef = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.total || 0;
      const ivaAef =
        this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF')?.total || 0;
      const otrosGastos = this.comisiones.data
        .filter((c) => ['OTROS GASTOS'].includes(c.commissionType?.name?.trim().toUpperCase()))
        .reduce((acc, curr) => acc + (curr.total || 0), 0);
      return montoFinanciar - this.investorInterests - aef - ivaAef - otrosGastos;
    }

    return this.projectData?.amount || 0;
  }

  getLoanTemplate() {
    this.loanService.getLoanAccountAssociationDetails(this.projectData.loanId).subscribe((data) => {
      this.loanTemplate = data;
      this.isFactoring = this.loanTemplate?.shortName === 'FACT';
      this.loadTypesCommissions();
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

  getCaeValue(): number {
    return this.caeValue;
  }

  getAdditionalExpensesByProjectId(): void {
    this.organizationService.getAdditionalExpensesByProjectId(this.projectData.id).subscribe((data) => {
      if (data && Array.isArray(data)) {
        const enriched = data.map((item) => {
          const tipo = this.commissionTypes.find((c) => c.id === item.commissionTypeId);
          return {
            ...item,
            id: item.id,
            commissionType: tipo
          };
        });

        this.comisiones.data = enriched;

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

  cancelEdit(): void {
    this.adicionalForm.reset();
    this.selectedCommission = null;
  }

  deleteCommission(commission: any): void {
    const isAEF = commission.commissionType?.name?.trim().toUpperCase() === 'AEF';
    const toDelete: any[] = [];

    // Buscar el IVA-AEF solo si el que se elimina es AEF
    if (isAEF) {
      const ivaAEF = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF');
      if (ivaAEF) {
        toDelete.push(ivaAEF);
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
  }

  // Función para remover una comisión de la tabla por ID o UUID
  private removeCommissionFromTable(commissionToRemove: any): void {
    this.comisiones.data = this.comisiones.data.filter((c) =>
      c.id ? c.id !== commissionToRemove.id : c.uuid !== commissionToRemove.uuid
    );
    this.comisiones._updateChangeSubscription();
    this.getTotalCredit();
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
      this.createForm();
    });
  }

  createForm() {
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

  sendEdit() {
    const modifiedData = {
      ...this.loanTemplateEdit,
      ...this.form.value
    };

    this.loanService.updateLoansAccount(this.projectData?.loanId, modifiedData).subscribe({
      next: (data) => {
        const principal = this.form.get('principal').value;
        const numberOfRepayments = this.form.get('numberOfRepayments').value;
        const interestRatePerPeriod = this.form.get('interestRatePerPeriod').value;
        this.submitProjectData(true, principal, interestRatePerPeriod, numberOfRepayments);
        this.alertService.alert({
          type: 'Success',
          message: this.translateService.instant('labels.heading.Saved Successfully')
        });
        this.reload();
      },
      error: (err) => {
        console.error('Error update loan:', err);
      }
    });
  }

  openFormEdit() {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'principal',
        label: 'Monto solicitado',
        type: 'number',
        value: this.form.get('principal')?.value,
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'loanTermFrequency',
        label: 'Plazo (meses)',
        type: 'number',
        value: this.form.get('loanTermFrequency')?.value,
        required: true,
        order: 2
      }),
      new InputBase({
        controlName: 'interestRatePerPeriod',
        label: 'Tasa de interés (%)',
        type: 'number',
        value: this.form.get('interestRatePerPeriod')?.value,
        required: true,
        order: 3
      })

    ];

    const data = {
      title: 'labels.heading.Credit Data',
      layout: { addButtonText: 'Save Changes' },
      formfields: formfields
    };

    const dialogRef = this.dialog.open(FormDialogComponent, { data });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data?.value) {
        const { principal, loanTermFrequency, interestRatePerPeriod } = response.data.value;

        this.form.patchValue({
          principal: +principal,
          loanTermFrequency: +loanTermFrequency,
          numberOfRepayments: +loanTermFrequency,
          interestRatePerPeriod: +interestRatePerPeriod
        });
        this.sendEdit();
      }
    });
  }

  reload() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  updateProjectData() {
    const payload = {
      amountToFinance: this.amountToFinance,
      amountToRequested: this.amountToRequested
    };
    this.organizationService
      .updateInvestmentProjects(this.projectData.idProject, payload)
      .subscribe((response: any) => {
        this.reload();
      });
  }

  getTotalCredit() {
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
      principal: this.getMontoAFinanciar(),
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

    this.loanService.calculateLoanSchedule(payload).subscribe((data: any) => {
      this.getMontoAEntregar();
      this.totalCredit = Math.round(data.totalRepaymentExpected);
      this.investorInterests = Math.round(data.totalInterestCharged);
      this.getCAE(data.periods);
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
}
