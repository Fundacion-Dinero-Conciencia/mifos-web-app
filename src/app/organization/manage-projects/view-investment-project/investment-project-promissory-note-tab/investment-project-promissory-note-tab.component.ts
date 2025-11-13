import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { ClientsService } from 'app/clients/clients.service';
import { AlertService } from 'app/core/alert/alert.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { getInvestmentGroupLabel, getInvestmentProcessGroupStatusLabel } from 'app/shared/helpers/states';
import { SystemService } from 'app/system/system.service';
import { of } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'mifosx-investment-project-promissory-note-tab',
  templateUrl: './investment-project-promissory-note-tab.component.html',
  styleUrls: ['./investment-project-promissory-note-tab.component.scss']
})
export class InvestmentProjectPromissoryNoteTabComponent implements OnInit {
  isCreatingPromissoryNoteGroup = false;
  projectData: any;
  clientClassificationTypeOptions: any;
  investorTypes: any[];
  filesvg = faFileAlt;
  PromissoryNoteGroups: any[];
  investorInGroup: any[] = [];
  loading = false;
  selectedNote: any = null;
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private alertService: AlertService,
    private clientsService: ClientsService,
    private systemService: SystemService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { accountData: any; PromissoryNoteGroups: any; clientTemplate: any }) => {
      this.projectData = data.accountData;
      this.clientClassificationTypeOptions = data.clientTemplate.clientClassificationOptions;
      this.PromissoryNoteGroups = data.PromissoryNoteGroups;
    });
    this.filters = this.formBuilder.group({
      clientClassificationId: [
        ''
      ],
      name: [
        ''
      ]
    });
    this.filters.valueChanges.pipe(debounceTime(300)).subscribe((values) => {});
  }
  currency: string;

  clientForm: UntypedFormGroup;
  filters: UntypedFormGroup;
  displayedColumnsGroups: string[] = [
    'Number',
    'Mnemotécnico',
    'InvestmentNumber',
    'Amount',
    'State',
    'Process',
    'Actions'
  ];
  displayedColumns: string[] = [
    'Investor',
    'Date',
    'Value invested',
    'Group'
  ];
  displayedColumnsLegal: string[] = [
    'add',
    'name',
    'lastName'
  ];
  displayedColumnsAval: string[] = [
    'add',
    'name',
    'lastName',
    'adress'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceGroups: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceLegal: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceAval: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  requestParams = {};
  ngOnInit(): void {
    this.dataSourceGroups.data = this.PromissoryNoteGroups;
    this.getDefaultCurrency();
    this.clientForm = this.formBuilder.group({
      documentNumber: [
        '',
        Validators.required
      ],
      date: [
        '',
        Validators.required
      ],
      mnemonic: [
        '',
        Validators.required
      ]
    });
  }

  getTodayFormatted(): string {
    const today = new Date();

    const day = today.getDate().toString().padStart(2, '0'); // 2 dígitos
    const month = today.toLocaleString('es-ES', { month: 'long' }).toLowerCase();
    const year = today.getFullYear();

    return `${day} ${month} ${year}`;
  }

  getStateLabel(state: string) {
    return getInvestmentGroupLabel(state as any);
  }

  deletePromissoryNoteGroup(groupId: string) {
    this.loading = true;
    this.organizationService.deletePromissoryNoteGroup(groupId).subscribe((response: any) => {
      this.loading = false;
      this.reloadComponent();
    });
  }

  createGroup() {
    this.loading = true;
    this.organizationService
      .createPromissoryNoteGroup({
        projectId: this.projectData.id,
        creationDate: this.getTodayFormatted(),
        dateFormat: 'dd MMMM yyyy',
        locale: 'es'
      })
      .subscribe((response: any) => {
        this.loading = false;
        this.reloadComponent();
      });
  }

  reloadComponent() {
    window.location.reload();
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  getMontoTotal(investments: any[]): number {
    let total = 0;
    investments.forEach((invest) => {
      total += invest.amount;
    });
    return total;
  }

  downloadPromissoryNote(id: string) {
    this.organizationService
      .downloadPromissoryNote(id)
      .pipe(
        catchError((error) => {
          this.alertService.alert({
            type: 'error',
            message: 'No tiene pagarè adjunto'
          });
          throw error;
        })
      )
      .subscribe((response: any) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }

  downloadRetailMandate(clientId: string, amount: string, projectId: string) {
    const jsonData = {
      clientId: clientId,
      amount: amount,
      projectId: projectId
    };
    this.organizationService.getRetailMandate(JSON.stringify(jsonData)).subscribe((response: any) => {
      const byteCharacters = atob(response);
      const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  downloadFundMandate(clientId: string) {
    const payload = { groupId: clientId };
    this.organizationService.generateFundPromissoryPdf(payload).subscribe((data: any) => {
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'PagareFondo.pdf';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    });
  }

  codeToState(code: number): string {
    switch (code) {
      case 100:
        return 'Aceptada';
      case 200:
        return 'Pendiente';
      case 300:
        return 'Rechazada';
      case 400:
        return 'Reservado';

      default:
        'Pendiente';
        break;
    }
  }

  onSubmitClient() {}

  onInvestorSelected(event: { checked: boolean }, client: any) {
    if (event.checked) {
      this.investorInGroup.push(client.participationId);
    } else {
      const index = this.investorInGroup.indexOf(client.participationId);
      if (index > -1) {
        this.investorInGroup.splice(index, 1);
      }
    }
  }

  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }
  startEditingPromissoryNoteGroup(id: any) {
    this.router.navigate(
      [
        'edit',
        id
      ],
      { relativeTo: this.route }
    );
  }

  getInvestmentProcessGroupStatusLabel(key: keyof typeof getInvestmentProcessGroupStatusLabel) {
    if (!key) {
      return '-';
    }
    return getInvestmentProcessGroupStatusLabel(key);
  }
  getToolTipInfo(state: any): string {
    const status = state?.status;
    const errorMessage = state?.errorMessage;
    const info: Record<string, string> = {
      INVALID: 'el proceso se invalido por ' + (errorMessage || 'un error desconocido.'),
      RUNNING: 'Proceso de aprobación en curso.',
      SUCCESS: 'Proceso finalizado con éxito',
      ERROR: 'el proceso se suspendió por ' + (errorMessage || 'un error desconocido.')
    };
    return info[status] || null;
  }
}
