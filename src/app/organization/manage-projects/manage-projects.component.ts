import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
import { ContinueSetupDialogComponent } from 'app/configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';
import { PopoverService } from 'app/configuration-wizard/popover/popover.service';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { environment } from 'environments/environment';
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'mifosx-manage-projects',
  templateUrl: './manage-projects.component.html',
  styleUrls: ['./manage-projects.component.scss']
})
export class ManageProjectsComponent implements OnInit {
  /** Manage Funds data. */
  projectsData: any[] = [];
  /** New Fund form */
  projectForm: any;
  /** State */
  state: any;
  /** Funds form reference */
  @ViewChild('formRef') formRef: any;

  /* Refernce of funds form */
  @ViewChild('projectFormRef') projectFormRef: ElementRef<any>;
  /* Template for popover on funds form */
  @ViewChild('templateFundFormRef') templateFundFormRef: TemplateRef<any>;
  /** Columns to be displayed in funds table. */
  displayedColumns: string[] = [
    'name',
    'Rut',
    'country',
    'active',
    'occupancyPercentage',
    'financedAmount',
    'amount',
    'rate',
    'creditType',
    'status'
  ];
  /** Data source for Funds table. */
  dataSource: MatTableDataSource<any>;

  projectUrl: string;
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;
  filterText: string = '';

  /** Paginator for charges table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for charges table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private valueText$ = new Subject<string>();

  /**
   * Retrieves the manage funds data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {OrganizationService} organizationservice Organization Service
   * @param {MatDialog} dialog Mat Dialog
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationservice: OrganizationService,
    public dialog: MatDialog,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService,
    private settingsService: SettingsService
  ) {
    this.applyOwnerFilter();
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.sort = this.sort;
    this.loadProjects();
    this.valueText$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((value) => {
      this.paginator.firstPage();
      this.filterText = value as string;
      this.loadProjects();
    });
    if (window.location.href.includes('dev')) {
      this.projectUrl = environment.baseUrlProject.replace('stg', 'dev');
    } else if (window.location.href.includes('stg')) {
      this.projectUrl = environment.baseUrlProject;
    } else {
      this.projectUrl = environment.baseUrlProjectProduction;
    }
  }
  applyFilter(filterValue: string) {
    this.valueText$.next(filterValue.trim().toLowerCase());
  }

  loadProjects() {
    this.organizationservice
      .getInvestmentProjects({
        page: this.pageIndex,
        size: this.pageSize,
        search: this.filterText
      })
      .subscribe((data: any) => {
        this.projectsData = data.content;
        this.totalItems = data.totalElements;
        this.dataSource.data = this.projectsData;
      });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProjects();
  }

  get tenantIdentifier(): string {
    if (!this.settingsService.tenantIdentifier || this.settingsService.tenantIdentifier === '') {
      return 'default';
    }
    return this.settingsService.tenantIdentifier;
  }
  setProjectUrl(project: any) {
    return this.projectUrl + project.id + '?isPublicView=1&publicTenant=' + this.tenantIdentifier.trim();
  }

  applyOwnerFilter() {
    const navigation = this.router.getCurrentNavigation();
    this.state = navigation?.extras?.state;
    if (this.state) {
      this.projectsData = this.projectsData.filter((project) => project.ownerId === this.state.ownerId);
    }
  }

  createFundForm() {
    this.projectForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Adds a new fund to the list.
   */
  addFund() {
    const newFund = this.projectForm.value;
    this.organizationservice.createFund(newFund).subscribe((response: any) => {
      this.projectsData.push({
        id: response.resourceId,
        name: newFund.name
      });
      this.formRef.resetForm();
      if (this.configurationWizardService.showManageFunds === true) {
        this.configurationWizardService.showManageFunds = false;
        this.openDialog();
      }
    });
  }

  /**
   * Edits the selected fund.
   * @param {string} fundId Fund Id.
   * @param {string} fundContent Fund's content.
   * @param {number} index  Index of fund.
   */
  editFund(fundId: string, fundContent: string, index: number) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'name',
        label: 'Fund Content',
        value: fundContent,
        type: 'text',
        required: true
      })

    ];
    const data = {
      title: 'Edit Fund',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editFundDialogRef = this.dialog.open(FormDialogComponent, { data });
    editFundDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.organizationservice.editFund(fundId, response.data.value).subscribe(() => {
          this.projectsData[index].name = response.data.value.name;
        });
      }
    });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * Previous Step (Organization Page) Dialog Configuration Wizard.
   */
  previousStep() {
    this.router.navigate(['/organization']);
  }

  /**
   * Next Step (Manage Reports) Dialog Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showManageFunds = false;
    this.configurationWizardService.showManageReports = true;
    this.router.navigate(['/system']);
  }

  /**
   * Opens dialog if the user wants  to edit more funds.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'fund'
      }
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
        this.configurationWizardService.showManageFunds = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showManageFunds = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/manage-funds']);
      } else if (response.step === 3) {
        this.configurationWizardService.showManageFunds = false;
        this.configurationWizardService.showManageReports = true;
        this.router.navigate(['/system']);
      }
    });
  }

  goToParticipations(projectId: number) {
    window.location.hash = `#/organization/project-participation/${projectId}`;
  }
}
