import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ClientsService } from 'app/clients/clients.service';
import { ProjectsService } from '../../manage-projects/manage-projects.service';
import { SystemService } from 'app/system/system.service';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { AccountingService } from 'app/accounting/accounting.service';
import { finalize } from 'rxjs/operators';
import { filter } from 'lodash';

@Component({
  selector: 'mifosx-create-project-participation',
  templateUrl: './create-project-participation.component.html',
  styleUrls: ['./create-project-participation.component.scss']
})
export class CreateProjectParticipationComponent implements OnInit, AfterViewInit {
  projectParticipationsData: any[] = [];
  dataSource: MatTableDataSource<any>;
  projectParticipationForm: UntypedFormGroup;
  participantsData: any[] = [];
  loading = false;
  projectsData: any[] = [];
  investmentFee: any;
  currency: any = {};
  filterOptions = [
    'Cliente',
    'RUT'
  ];

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private organizationService: OrganizationService,
    private clientsService: ClientsService,
    private projectsService: ProjectsService,
    private systemService: SystemService,
    private loanService: LoansService,
    private accountingService: AccountingService
  ) {
    this.projectParticipationForm = this.formBuilder.group({
      participantId: [
        '',
        Validators.required
      ],
      filterBy: [
        'Cliente'
      ],
      projectId: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ],
      commission: [
        '',
        Validators.required
      ]
    });

    this.route.data.subscribe((data: { projectparticipations: any }) => {
      this.projectParticipationsData = [];
      if (data.projectparticipations) {
        data.projectparticipations.forEach((item: any) => {
          item.createdOnDate = new Date(item.createdOnDate);
          this.projectParticipationsData.push(item);
        });
        this.dataSource = new MatTableDataSource(this.projectParticipationsData);
      }
      this.participantsData = [];
      this.projectsData = [];
    });
  }

  ngOnInit(): void {
    this.getDefaultCurrency();
    this.dataSource = new MatTableDataSource(this.projectParticipationsData);
    this.getInvestmentFeeConfiguration();
    this.setupListeners();
  }

  /**
   * Get the Configuration and the investment fee value
   */
  getInvestmentFeeConfiguration(): void {
    this.systemService.getConfigurationByName('investment-fee').subscribe((configurationData: any) => {
      const value = parseFloat(configurationData.stringValue);
      this.investmentFee = isNaN(value) ? 0 : value;
    });
  }

  /**
   * Displays Project name in form control input.
   * @param {any} project Project data.
   * @returns {string} Project name if valid otherwise undefined.
   */
  displayProject(project: any): string | undefined {
    return project ? project.name : undefined;
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayParticipant(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  submit() {
    this.loading = true;
    const payload = {
      ...this.projectParticipationForm.getRawValue(),
      filterBy: undefined
    };
    const participant: any = payload['participantId'];
    payload['participantId'] = participant['id'];
    const project: any = payload['projectId'];
    payload['projectId'] = project['id'];
    payload['amount'] = payload['amount'] * 1;
    payload['commission'] = payload['commission'] * 1;
    payload['status'] = 400;
    payload['type'] = 'MANUAL';

    this.organizationService
      .createInvestmentProjectParticipations(payload)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (response: any) => {
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (err) => {
          console.error('Error al crear participación:', err);
          this.loading = false;
        }
      });
  }

  ngAfterViewInit() {
    this.projectParticipationForm.controls.projectId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.projectsService.getFilteredProjects(value, 'En Financiamiento').subscribe((data: any) => {
          this.projectsData = data;
        });
      }
    });

    this.projectParticipationForm.controls.participantId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService
          .getFilteredClientsByParamName(
            null,
            'ASC',
            true,
            this.projectParticipationForm.get('filterBy').value === 'Cliente' ? 'displayName' : 'rut',
            value
          )
          .subscribe((data: any) => {
            this.participantsData = data.pageItems;
          });
      }
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.accountingService.getCurrencies().subscribe((currencies) => {
        const defaultCurrency = currencies?.selectedCurrencyOptions.find((c: any) => c.code === data.stringValue);
        if (defaultCurrency) {
          this.currency = defaultCurrency;
        }
      });
    });
  }

  setupListeners(): void {
    this.projectParticipationForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateCUFCommission();
    });
  }

  calculateCUFCommission() {
    const selectedProject = this.projectParticipationForm.get('projectId')?.value;
    if (selectedProject) {
      const amountValue = this.projectParticipationForm.get('amount')?.value;
      var isFactoring;
      this.loanService.getLoanAccountAssociationDetails(selectedProject.loanId).subscribe((data: any) => {
        console.log('DATA LOAN', data);
        const loanTemplate: any = data;
        isFactoring = loanTemplate?.shortName === 'FACT';
        var periods = isFactoring === true ? selectedProject.period / 30 : selectedProject.period;
        periods = periods > 10 ? 10 : periods;
        const percentageParticipation = amountValue / data?.approvedPrincipal;
        var commissionValue = data?.approvedPrincipal * this.investmentFee * periods * percentageParticipation;
        const rawValue = commissionValue / 100;
        const rounded = Math.round(rawValue);
        console.log(rounded);
        this.projectParticipationForm.get('commission')?.setValue(rounded > 0 ? rounded : 0);
      });
    }
  }
}
