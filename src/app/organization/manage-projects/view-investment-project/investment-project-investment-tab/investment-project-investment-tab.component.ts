import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { ClientsService } from 'app/clients/clients.service';
import { AlertService } from 'app/core/alert/alert.service';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { of } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';
@Component({
  selector: 'mifosx-investment-project-investment-tab',
  templateUrl: './investment-project-investment-tab.component.html',
  styleUrls: ['./investment-project-investment-tab.component.scss']
})
export class InvestmentProjectInvestmentTabComponent implements OnInit {
  projectData: any;
  clientClassificationTypeOptions: any;
  investorTypes: any[];
  filesvg = faFileAlt;
  currency: string;
  pageIndex = 0;
  pageSize = 5;
  totalItems = 0;
  filterOptions = [
    'Cliente',
    'RUT'
  ];
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private loansService: LoansService,
    private alertService: AlertService,
    private clientsService: ClientsService,
    private systemService: SystemService
  ) {
    this.route.data.subscribe((data: { accountData: any; investments: any; clientTemplate: any }) => {
      this.projectData = data.accountData;
      this.clientClassificationTypeOptions = data.clientTemplate.clientClassificationOptions;
    });
    this.filters = this.formBuilder.group({
      filterBy: [
        'Cliente'
      ],
      clientClassificationId: [
        ''
      ],
      name: [
        ''
      ]
    });
    this.filters.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      this.paginator.firstPage();
      this.loadInvestments(0, this.paginator.pageSize, values);
    });
  }
  filters: UntypedFormGroup;
  displayedColumns: string[] = [
    'Rut',
    'Investor',
    'date',
    'Value invested',
    'Investment status',
    'Watch order',
    'Watch promissory note'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  requestParams = {};
  ngOnInit(): void {
    this.getDefaultCurrency();
    this.loadInvestments(0, this.pageSize);
  }
  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }
  downloadPromissoryNote(subCreditId: string, promissoryPdfId: string) {
    this.loansService.downloadLoanDocument(subCreditId, promissoryPdfId).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  getMandate(clientId: string, amount: string, projectId: string) {
    this.clientsService.getClientData(clientId).subscribe((response: any) => {
      if (response.legalForm.value === 'Entity') {
        this.downloadFundMandate(clientId, amount);
      } else {
        this.downloadRetailMandate(clientId, amount, projectId);
      }
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
  downloadFundMandate(clientId: string, amount: string) {
    const jsonData = {
      clientId: clientId,
      amount: amount
    };
    this.organizationService.getFundMandate(JSON.stringify(jsonData)).subscribe((response: any) => {
      const byteCharacters = atob(response);
      const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  loadInvestments(page: number, size: number, filters?: any) {
    this.requestParams = {
      projectId: this.projectData?.id,
      page,
      size,
      name: this.filters.get('filterBy').value === 'Cliente' ? filters?.name : undefined,
      rut: this.filters.get('filterBy').value !== 'Cliente' ? filters?.name : undefined,
      classificationId: filters?.clientClassificationId || undefined
    };

    this.organizationService
      .getProjectParticipationPageable(this.requestParams)
      .pipe(
        catchError((error) => {
          this.alertService.alert({
            type: 'error',
            message: 'Ocurrió un error al cargar las inversiones'
          });

          return of({ content: [] as any[], total: 0 });
        })
      )
      .subscribe((response: any) => {
        this.dataSource.data = response.content || response;
        this.pageSize = size;
        this.pageIndex = page;
        this.totalItems = response.total;
      });
  }

  resetFilters() {
    this.filters.reset();
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

  onPageChange(event: any) {
    this.loadInvestments(event.pageIndex, event.pageSize);
  }

  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }
  applyFilterOptionChange(event: any) {
    this.filters.get('name')?.setValue('');
  }
}
