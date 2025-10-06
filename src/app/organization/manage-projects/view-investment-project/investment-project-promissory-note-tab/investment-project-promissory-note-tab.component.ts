import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { ClientsService } from 'app/clients/clients.service';
import { AlertService } from 'app/core/alert/alert.service';
import { OrganizationService } from 'app/organization/organization.service';
import { catchError, debounceTime } from 'rxjs/operators';
import { of } from 'rxjs';

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
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private alertService: AlertService,
    private clientsService: ClientsService
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
    this.filters.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      this.paginator.firstPage();
      this.loadInvestments(0, this.paginator.pageSize, values);
    });
  }
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
    this.loadInvestments(0, 10);
    this.dataSourceGroups.data = this.PromissoryNoteGroups;
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
  startCreatingPromissoryNoteGroup() {
    this.isCreatingPromissoryNoteGroup = true;
    this.clientForm = this.formBuilder.group({
      name: [''],
      clientClassificationId: ['']
    });
  }

  loadInvestments(page: number, size: number, filters?: any) {
    this.requestParams = {
      projectId: this.projectData?.id,
      page,
      size,
      name: filters?.name || undefined,
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
        this.paginator.length = response.total;
        this.dataSource.paginator = this.paginator;
      });
  }

  onPageChange(event: any) {
    this.loadInvestments(event.pageIndex, event.pageSize);
  }

  onSubmitClients() {}
}
