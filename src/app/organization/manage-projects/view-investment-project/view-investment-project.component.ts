import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
@Component({
  selector: 'mifosx-view-investment-project',
  templateUrl: './view-investment-project.component.html',
  styleUrls: ['./view-investment-project.component.scss']
})
export class ViewInvestmentProjectComponent {
  projectData: any;
  constructor(
    public router: Router,
    private organizationService: OrganizationService,
    private route: ActivatedRoute
  ) {
    const projectId = this.route.snapshot.paramMap.get('id');
    this.organizationService.getInvestmentProject(projectId).subscribe((data) => {
      this.projectData = data;
    });
  }
}
