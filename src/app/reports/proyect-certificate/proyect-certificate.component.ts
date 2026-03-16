import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ReportsService } from '../reports.service';
import { finalize } from 'rxjs/operators';
import { ProjectsService } from 'app/organization/manage-projects/manage-projects.service';
import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-proyect-certificate',
  templateUrl: './proyect-certificate.component.html',
  styleUrls: ['./proyect-certificate.component.scss']
})
export class ProyectCertificateComponent implements OnInit, AfterViewInit {
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
      ]
    });
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
        this.groupsFilteredData = [];
        this.projectsFilteredData = [];
        return;
      }
      if (typeof value !== 'string' && value !== null) {
        const clientId = value.id;

        this.reportForm.get('project')?.setValue('');
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
      if (typeof value === 'string' && value.length >= 1 && this.projectsData) {
        this.selectedProject = null;
        this.loading = true;
        const filteredProjects = this.projectsData.filter((project: any) =>
          this.filterprojectsByName(project, value.trim())
        );
        this.projectsFilteredData = filteredProjects;
      }
    });
  }
  displayProject(project: any): string {
    return project ? `${project.id} - ${project.name}` : '';
  }

  get canDownload(): boolean {
    if (typeof this.reportForm?.get('project')?.value === 'object' && this.reportForm.get('project')?.value !== null) {
      return true;
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
      .getProjectCertificatePDF(this.reportForm.value.project.id)
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
