import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ReportsService } from '../reports.service';
import { finalize } from 'rxjs/operators';
import { ProjectsService } from 'app/organization/manage-projects/manage-projects.service';
import { ClientsService } from 'app/clients/clients.service';
@Component({
  selector: 'mifosx-debt-certificate',
  templateUrl: './debt-certificate.component.html',
  styleUrls: ['./debt-certificate.component.scss']
})
export class DebtCertificateComponent implements OnInit, AfterViewInit {
  reportForm: UntypedFormGroup;
  clientsData: any[] = [];
  projectsData: null | any[] = null;
  selectedProject: any;
  selectedClient: any;
  groupsData: any[] = [];
  groupsFilteredData: any[] = [];
  projectsFilteredData: any[] = [];
  years: number[] = [];
  loading = false;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private reportsService: ReportsService,
    private projectsService: ProjectsService,
    private organizationService: OrganizationService,
    private clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.formBuilder.group({
      client: [
        '',
        Validators.required
      ],
      project: [
        '',
        Validators.required
      ],
      group: [
        '',
        Validators.required
      ]
    });
    this.reportForm.get('group')?.disable();
    this.reportForm.get('project')?.disable();
  }
  ngAfterViewInit() {
    this.reportForm.controls.client.valueChanges.subscribe((value: string | Record<string, any>) => {
      if (typeof value === 'string' && value.length >= 2) {
        this.selectedClient = null;
        this.reportForm.get('project')?.disable();
        this.projectsData = [];
        this.loading = true;

        this.clientsService.searchByText(value).subscribe((data: any) => {
          this.clientsData = data.content;
          this.loading = false;
        });

        this.reportForm.get('project')?.setValue('');
        this.reportForm.get('group')?.setValue('');
        this.reportForm.get('group')?.disable();
        this.groupsFilteredData = [];
        this.projectsFilteredData = [];
        return;
      }
      if (typeof value !== 'string' && value !== null) {
        const clientId = value.id;

        this.reportForm.get('project')?.setValue('');
        this.reportForm.get('group')?.setValue('');
        this.reportForm.get('group')?.disable();
        this.groupsFilteredData = [];

        this.loading = true;

        this.projectsService.getProyectByClientId(clientId).subscribe((projects: any[]) => {
          this.projectsData = projects;
          this.projectsFilteredData = projects;
          this.loading = false;

          if (!projects || projects.length === 0) {
            this.reportForm.get('project')?.disable();
          } else {
            this.reportForm.get('project')?.enable();
          }
        });
      }
    });
    this.reportForm.controls.project.valueChanges.subscribe((value: string | Record<string, string>) => {
      if (typeof value !== 'string' && value !== null) {
        const projectId = value.id;
        this.organizationService.getPromissoryNoteGroups(projectId).subscribe((data: any) => {
          this.groupsData = data;
          this.groupsFilteredData = data;
          if (data.length === 0) {
            this.reportForm.get('group')?.disable();
          } else {
            this.reportForm.get('group')?.enable();
          }
        });
      }
      if (typeof value === 'string' && value.length >= 1 && this.projectsData) {
        this.selectedProject = null;
        this.reportForm.get('group')?.disable();
        this.groupsFilteredData = [];
        this.loading = true;
        const filteredProjects = this.projectsData.filter((project: any) =>
          this.filterprojectsByName(project, value.trim())
        );
        this.projectsFilteredData = filteredProjects;
      }
      this.reportForm.get('group')?.setValue('');
    });

    this.reportForm.controls.group.valueChanges.subscribe((value: string) => {
      if (typeof value === 'object' && value !== null) {
        return;
      }
      if (!value || value.length < 1) {
        this.groupsFilteredData = this.groupsData;
        return;
      } else {
        const filteredGroups = this.groupsData.filter((group: any) =>
          this.filterByDocumentnumberAnadMnemonic(group, value.trim())
        );
        this.groupsFilteredData = filteredGroups;
      }
    });
  }
  displayProject(project: any): string {
    return project ? `${project.id} - ${project.name}` : '';
  }
  displayGroup(group: any): string {
    return group ? `${group.mnemonic}` : '';
  }

  get canDownload(): boolean {
    if (typeof this.reportForm?.get('group')?.value === 'object' && this.reportForm.get('group')?.value !== null) {
      return true;
    }
    return false;
  }

  get noGroupsInCurrentProject(): boolean {
    if (
      typeof this.reportForm?.get('project')?.value === 'object' &&
      this.reportForm.get('project')?.value !== null &&
      !this.loading
    ) {
      if (this.groupsData.length === 0) {
        return true;
      }
    }
    return false;
  }

  get noProjectsForCurrentClient(): boolean {
    if (
      typeof this.reportForm?.get('client')?.value === 'object' &&
      this.reportForm.get('client')?.value !== null &&
      !this.loading
    ) {
      if (this.projectsData && this.projectsData.length === 0) {
        return true;
      }
    }
    return false;
  }

  filterByDocumentnumberAnadMnemonic(group: any, value: string): boolean {
    if (!value) {
      return true;
    }
    const documentNumberMatch = String(group.documentNumber).includes(value.toLowerCase());
    const mnemonicMatch = group.mnemonic.toLowerCase().includes(value.toLowerCase());
    return documentNumberMatch || mnemonicMatch;
  }

  filterprojectsByName(project: any, value: string): boolean {
    if (!value) {
      return true;
    }
    const nameMatch = project.name.toLowerCase().includes(value.toLowerCase());
    return nameMatch;
  }

  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  downloadReport() {
    this.loading = true;
    this.reportsService
      .getDebtCertificatePDF(this.reportForm.value.group.id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }
}
