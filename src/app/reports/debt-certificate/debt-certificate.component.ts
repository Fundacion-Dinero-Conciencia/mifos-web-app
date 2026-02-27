import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ReportsService } from '../reports.service';
import { finalize } from 'rxjs/operators';
import { ProjectsService } from 'app/organization/manage-projects/manage-projects.service';
@Component({
  selector: 'mifosx-debt-certificate',
  templateUrl: './debt-certificate.component.html',
  styleUrls: ['./debt-certificate.component.scss']
})
export class DebtCertificateComponent implements OnInit, AfterViewInit {
  reportForm: UntypedFormGroup;
  projectsData: null | Record<string, string> = null;
  selectedProject: any;
  groupsData: any[] = [];
  groupsFilteredData: any[] = [];
  years: number[] = [];
  loading = false;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private reportsService: ReportsService,
    private projectsService: ProjectsService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.formBuilder.group({
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
  }
  ngAfterViewInit() {
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
      if (typeof value === 'string' && value.length >= 2) {
        this.selectedProject = null;
        this.reportForm.get('group')?.disable();
        this.groupsFilteredData = [];
        this.loading = true;
        this.projectsService.getAllProject(value).subscribe((data: any) => {
          this.projectsData = data;
          this.loading = false;
        });
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

  filterByDocumentnumberAnadMnemonic(group: any, value: string): boolean {
    if (!value) {
      return true;
    }
    const documentNumberMatch = String(group.documentNumber).includes(value.toLowerCase());
    const mnemonicMatch = group.mnemonic.toLowerCase().includes(value.toLowerCase());
    return documentNumberMatch || mnemonicMatch;
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
