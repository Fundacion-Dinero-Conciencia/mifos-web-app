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

@Component({
  selector: 'app-investment-project-commission-tab',
  templateUrl: './investment-project-commission-tab.component.html',
  styleUrls: ['./investment-project-commission-tab.component.css']
})
export class InvestmentProjectCommissionTabComponent implements OnInit {

  currency: any;
  adicionalForm!: FormGroup;
  projectData: any;
  commissionTypes: any[] = [];
  commissionToShow: any[] = [];
  commissionAEF: any[] = [];
  comisiones: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = ['commissionType', 'description', 'netAmount', 'vat', 'total'];


  constructor(private fb: FormBuilder,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private alertService: AlertService,
    private loanService: LoansService) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }

  ngOnInit(): void {
    this.getDefaultCurrency();
    this.adicionalForm = this.fb.group({
      commissionTypeId: [null, Validators.required],
      description: ['', Validators.required],
      netAmount: [null, [Validators.required, Validators.min(0)]],
      vat: [null],
      total: [null]
    });

    this.loadTypesCommissions();
  }

  loadTypesCommissions(): void {
    this.systemService.getCodeByName('CONFIG_COMMISSION_TAXES').subscribe(data => {
      this.commissionTypes = data?.codeValues?.filter((cv: any) => cv.active);
      this.commissionToShow = this.commissionTypes.filter((cv: any) =>
        ['OTROS GASTOS', 'ITE', 'MONTO FACTURA'].includes(cv.name?.trim().toUpperCase())
      );
      this.systemService.getCodeByName('COMMISSION_AEF').subscribe(data => {
        this.commissionAEF = data?.codeValues?.filter((cv: any) => cv.active);

        this.addCommissionAEF();
      });
    });
  }


  getIvaVigente(): number {
    const ivaItem = this.commissionTypes.find(t => t.name?.trim().toLowerCase() === 'iva');
    return parseFloat(ivaItem.description);
  }



  addCommission(): void {
    const formValue = this.adicionalForm.value;
    const tipo = this.commissionTypes.find(c => c.id === formValue.commissionTypeId);
    const total = formValue.netAmount + (formValue.netAmount * this.getIvaVigente()) / 100;
    const nuevaComision = {
      commissionType: tipo,
      description: formValue.description,
      netAmount: formValue.netAmount,
      vat: this.getIvaVigente(),
      total: total
    };

    this.comisiones.data = [...this.comisiones.data, nuevaComision];
    this.adicionalForm.reset();
  }

  calcularComision(): void {

    const formValue = this.adicionalForm.value;
    const tipo = this.commissionTypes.find(c => c.id === formValue.commissionTypeId);

    if (tipo.name.trim().toUpperCase() === 'ITE') {
      this.addCommissionITE();
    } else if (tipo.name.trim().toUpperCase() === 'OTROS GASTOS') {
      this.addCommission();
    } else if (tipo.name.trim().toUpperCase() === 'MONTO FACTURA') {
      this.addCommissionAmountInvoice();
    }
    this.comisiones._updateChangeSubscription();
  }

  addCommissionAEF(): void {
    const montoSolicitado = this.projectData?.amount;
    const tasaAEF = this.getCommissionAcordingByPeriod();
    const montoAEF = (montoSolicitado * tasaAEF) / 100;
    const ivaAEF = (montoAEF * this.getIvaVigente()) / 100;

    const tipoAEF = this.getCommissionByName('AEF');
    const tipoIVAAEF = this.getCommissionByName('IVA-AEF');

    if (tipoAEF) {
      this.comisiones.data.push({
        commissionType: tipoAEF,
        description: 'Comisión por Asesoría de Estructuración Financiera (AEF)',
        netAmount: this.projectData?.amount,
        vat: tasaAEF,
        total: montoAEF
      });
    }

    if (tipoIVAAEF) {
      this.comisiones.data.push({
        commissionType: tipoIVAAEF,
        description: 'IVA sobre AEF',
        netAmount: montoAEF,
        vat: this.getIvaVigente(),
        total: ivaAEF
      });
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
    if (formValue.vat) {
      const total = (formValue.netAmount * formValue.vat) / 100;
      this.comisiones.data.push({
        commissionType: tipoInvoice,
        description: 'Monto de factura (factoring)',
        netAmount: formValue.netAmount,
        vat: formValue.vat,
        total: total
      });
      this.adicionalForm.reset();
    } else {
      this.alertService.alert({
        type: 'Warning',
        message: this.translateService.instant('errors.validation.msg.percentage.required')
      });
    }

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
    const aef = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'AEF');
    const montoAEF = aef?.total || 0;

    // Buscar IVA sobre AEF
    const ivaAef = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF');
    const montoIVAAEF = ivaAef?.total || 0;

    // Sumar OTROS GASTOS
    const otrosGastos = this.comisiones.data
      .filter(c => ['OTROS GASTOS'].includes(c.commissionType?.name?.trim().toUpperCase()))
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    const pagaré = amount + montoAEF + montoIVAAEF + otrosGastos;
    return pagaré;
  }



  getCommissionByName(nombre: string): any {
    return this.commissionTypes.find(t => t.name?.trim().toLowerCase() === nombre.toLowerCase());
  }

  getCommissionAcordingByPeriod(): number | null {
    const period = this.projectData?.period;
    if (period == null || !this.commissionAEF?.length) return null;

    const activeCommissions = this.commissionAEF.filter(item => item.active);

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
    const payload = this.comisiones.data.map(c => ({
      projectId: this.projectData.id,
      commissionTypeId: c.commissionType.id,
      description: c.description,
      netAmount: c.netAmount,
      vat: c.vat,
      total: c.total
    }));
    this.organizationService.saveAdditionalExpenses(payload).subscribe(data => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });


    console.log('Guardando comisiones en backend', payload);
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  isITESelected(): boolean {
    const commissionId = this.adicionalForm.get('commissionTypeId')?.value;
    const commission = this.commissionToShow.find(c => c.id === commissionId);
    return commission?.name === 'ITE';
  }

  submit() {
    const warningtDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Approve Share'),
        dialogContext: this.translateService.instant(
          'labels.text.Are you sure you want to save commisions not edit'
        ),
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
    console.log("IsFactoring", this.projectData?.loanId?.toString().toUpperCase());
    return this.projectData?.loanId?.toString().toUpperCase() === '2'; // reemplazar por factoring y tomar el producto
  }

  getMontoAFinanciar(): number {
    const aef = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.total || 0;
    const ivaAef = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF')?.total || 0;
    const otrosGastos = this.comisiones.data
      .filter(c => ['OTROS GASTOS', 'MONTO FACTURA'].includes(c.commissionType?.name?.trim().toUpperCase()))
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const ite = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'ITE')?.total || 0;

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
      const aef = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'AEF')?.total || 0;
      const ivaAef = this.comisiones.data.find(c => c.commissionType?.name?.trim().toUpperCase() === 'IVA-AEF')?.total || 0;
      const otrosGastos = this.comisiones.data
        .filter(c => ['OTROS GASTOS'].includes(c.commissionType?.name?.trim().toUpperCase()))
        .reduce((acc, curr) => acc + (curr.total || 0), 0);
      return montoFinanciar - valorIntereses - aef - ivaAef - otrosGastos;
    }

    return this.projectData?.amount || 0;
  }

  getScheduleAndPercentageCAE() {
    //repaymentSchedule.periods.totalInstallmentAmountForPeriod || principalDisbursed
    this.loanService.getLoanAccountAssociationDetails(this.projectData.loanId);
  }



}
