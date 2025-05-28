import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/alert/alert.service';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { SystemService } from 'app/system/system.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'mifosx-investment-project-commission-tab',
  templateUrl: './investment-project-commission-tab.component.html',
  styleUrls: ['./investment-project-commission-tab.component.css']
})
export class InvestmentProjectCommissionTabComponent implements OnInit {
  caeValue: any;
  loanTemplate: any;
  selectedCommission: any = null;
  currency: any;
  adicionalForm!: FormGroup;
  projectData: any;
  commissionTypes: any[] = [];
  commissionToShow: any[] = [];
  commissionAEF: any[] = [];
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
    private loanService: LoansService
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
      this.getLoanTemplate();
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

    this.loadTypesCommissions();
  }

  loadTypesCommissions(): void {
    this.systemService.getCodeByName('CONFIG_COMMISSION_TAXES').subscribe((data) => {
      this.commissionTypes = data?.codeValues?.filter((cv: any) => cv.active);
      this.commissionToShow = this.commissionTypes.filter((cv: any) => [
          'OTROS GASTOS',
          'ITE',
          'MONTO FACTURA'
        ].includes(cv.name?.trim().toUpperCase()));
      this.systemService.getCodeByName('COMMISSION_AEF').subscribe((data) => {
        this.commissionAEF = data?.codeValues?.filter((cv: any) => cv.active);
        this.getAdditionalExpensesByProjectId();
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
    const vat = formValue.vat ?? this.getIvaVigente();

    const total = formValue.netAmount + (formValue.netAmount * vat) / 100;

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
  }

  calcularComision(): void {
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
    const montoAEF = (montoSolicitado * tasaAEF) / 100;
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

    this.comisiones._updateChangeSubscription();
  }

  addCommissionITE() {
    const tipoITE = this.getCommissionByName('ITE');
    const prommisoryAmount = this.calculatePromissoryNote();
    const percentage = this.getPercentageITEAcordingPeriod();
    const total = (prommisoryAmount * percentage * this.projectData?.period) / 100;
    this.comisiones.data.push({
      commissionType: tipoITE,
      description: 'Impuesto de Timbres y Estampillas (ITE)',
      netAmount: prommisoryAmount,
      vat: percentage,
      total: total
    });
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
  }

  getPercentageITEAcordingPeriod(): number {
    const ite = this.getCommissionByName('ITE');
    const period = this.projectData?.period;

    if (!ite?.description || period == null) return null;

    const match = ite.description.match(/([\d.]+)-([\d.]+)/);
    if (!match) return null;

    const lower = parseFloat(match[1]);
    const upper = parseFloat(match[2]);

    return period >= 12 ? lower : upper;
  }

  calculatePromissoryNote(): number {
    const amount = this.projectData?.amount || 0;

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

    const pagaré = amount + montoAEF + montoIVAAEF + otrosGastos;
    return pagaré;
  }

  getCommissionByName(nombre: string): any {
    return this.commissionTypes.find((t) => t.name?.trim().toLowerCase() === nombre.toLowerCase());
  }

  getCommissionAcordingByPeriod(): number | null {
    const period = this.projectData?.period;
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
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  isITESelected(): boolean {
    const commissionId = this.adicionalForm.get('commissionTypeId')?.value;
    const commission = this.commissionToShow.find((c) => c.id === commissionId);
    return commission?.name === 'ITE';
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
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  isFactoring(): boolean {
    return this.projectData?.loanId?.toString().toUpperCase() === '2'; // reemplazar por factoring y tomar el producto
  }

  getMontoAFinanciar(): number {
    const aef = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.total || 0;
    const ivaAef =
      this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF')?.total || 0;
    const otrosGastos = this.comisiones.data
      .filter((c) => [
          'OTROS GASTOS',
          'MONTO FACTURA'
        ].includes(c.commissionType?.name?.trim().toUpperCase()))
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const ite = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'ITE')?.total || 0;

    if (this.isFactoring()) {
      const porcentajeFinanciamiento = this.projectData?.porcentajeFinanciamientoFactura || 100;
      const montoFactura = this.projectData?.montoFactura || this.projectData?.amount || 0;
      const base = (montoFactura * porcentajeFinanciamiento) / 100;
      return base + aef + ivaAef + otrosGastos;
    }

    return (this.projectData?.amount || 0) + aef + ivaAef + otrosGastos + ite;
  }

  getMontoAEntregar(): number {
    if (this.isFactoring()) {
      const montoFinanciar = this.getMontoAFinanciar();
      const valorIntereses = this.projectData?.valorInteresesInversionistas || 0;
      const aef = this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.total || 0;
      const ivaAef =
        this.comisiones.data.find((c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF')?.total || 0;
      const otrosGastos = this.comisiones.data
        .filter((c) => ['OTROS GASTOS'].includes(c.commissionType?.name?.trim().toUpperCase()))
        .reduce((acc, curr) => acc + (curr.total || 0), 0);
      return montoFinanciar - valorIntereses - aef - ivaAef - otrosGastos;
    }

    return this.projectData?.amount || 0;
  }

  getLoanTemplate() {
    //repaymentSchedule.periods.totalInstallmentAmountForPeriod || principalDisbursed
    this.loanService.getLoanAccountAssociationDetails(this.projectData.loanId).subscribe((data) => {
      this.loanTemplate = data;
      this.getCAE();
    });
  }

  getCAE() {
    const installments = this.loanTemplate?.repaymentSchedule?.periods;

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
    });
  }

  editCommission(commission: any): void {
    console.log(commission);
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

  deleteCommission(index: number): void {
    const commission = this.comisiones.data[index];
    const toDelete = [];

    // Si es AEF, buscar también IVA-AEF
    if (commission.commissionType?.name?.trim().toUpperCase() === 'AEF') {
      const ivaIndex = this.comisiones.data.findIndex(
        (c) => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF'
      );
      if (ivaIndex !== -1) {
        toDelete.push({ index: ivaIndex, commission: this.comisiones.data[ivaIndex] });
      }
    }

    // Agregar la comisión original a eliminar
    toDelete.push({ index, commission });

    // Ordenar los índices de mayor a menor para eliminar sin errores
    toDelete.sort((a, b) => b.index - a.index);

    // Procesar cada eliminación
    toDelete.forEach((item) => {
      const { index, commission } = item;

      if (commission.id) {
        // Eliminar desde el backend
        this.organizationService.deleteAdditionalExpensesById(commission.id).subscribe({
          next: () => {
            this.comisiones.data.splice(index, 1);
            this.comisiones._updateChangeSubscription();
            this.alertService.alert({
              type: 'Warning',
              message: this.translateService.instant('errors.validation.msg.percentage.required')
            });
          },
          error: () => {
            this.alertService.alert({
              type: 'Warning',
              message: this.translateService.instant('errors.validation.msg.percentage.required')
            });
          }
        });
      } else {
        // Solo eliminar localmente
        this.comisiones.data.splice(index, 1);
        this.comisiones._updateChangeSubscription();
      }
    });
  }
}
