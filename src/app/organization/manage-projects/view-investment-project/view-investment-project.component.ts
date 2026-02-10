import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'mifosx-view-investment-project',
  templateUrl: './view-investment-project.component.html',
  styleUrls: ['./view-investment-project.component.scss']
})
export class ViewInvestmentProjectComponent implements OnInit {
  projectData: any;
  projectUrl: string;

  constructor(
    public router: Router,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    const projectId = this.route.snapshot.paramMap.get('id');
    this.organizationService.getInvestmentProject(projectId).subscribe((data) => {
      this.projectData = data;
    });
  }

  ngOnInit(): void {
    if (window.location.href.includes('dev')) {
      this.projectUrl = environment.baseUrlProject.replace('stg', 'dev');
    } else if (window.location.href.includes('stg')) {
      this.projectUrl = environment.baseUrlProject;
    } else {
      this.projectUrl = environment.baseUrlProjectProduction;
    }
  }

  get tenantIdentifier(): string {
    if (!this.settingsService.tenantIdentifier || this.settingsService.tenantIdentifier === '') {
      return 'default';
    }
    return this.settingsService.tenantIdentifier;
  }
  goToParticipations(projectId: number) {
    window.location.hash = `#/organization/project-participation/${projectId}`;
  }
  setProjectUrl(project: any) {
    if (!project) {
      return '';
    }
    return this.projectUrl + project.id + '?isPublicView=1&publicTenant=' + this.tenantIdentifier.trim();
  }
}
