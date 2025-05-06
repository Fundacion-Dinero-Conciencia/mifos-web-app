import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-edit-investment-project',
  templateUrl: './edit-investment-project.component.html',
  styleUrls: ['./edit-investment-project.component.scss']
})
export class EditInvestmentProjectComponent implements OnInit {
  /** New Investment Project form */
  investmentProjectForm: UntypedFormGroup;
  categoryData: any[] = [];
  subcategoryData: any[] = [];
  areaData: any[] = [];
  statusData: any[] = [];
  objectivesData: any[] = [];
  idProject: any;
  projectData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private organizationService: OrganizationService,
    private systemService: SystemService
  ) {
    this.route.data.subscribe(
      (data: {
        accountData: any;
        categoryData: any;
        subcategoryData: any;
        areaData: any;
        statusData: any;
        objectivesData: any;
      }) => {
        this.categoryData = data.categoryData.codeValues;
        this.subcategoryData = data.subcategoryData.codeValues;
        this.areaData = data.areaData.codeValues;
        this.statusData = data.statusData.codeValues;
        this.objectivesData = data.objectivesData.codeValues;
      }
    );
  }

  ngOnInit(): void {
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
    this.setupInvestmentProjectForm(this.idProject);
  }

  async setupInvestmentProjectForm(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.organizationService.getInvestmentProject(id).subscribe({
        next: (data) => {
          this.projectData = data;

          console.log('dataa: ', data);

          this.investmentProjectForm = this.formBuilder.group({
            name: [
              data.name,
              Validators.required
            ],
            subtitle: [
              data.subtitle,
              Validators.required
            ],
            mnemonic: [
              data.mnemonic,
              Validators.required
            ],
            impactDescription: [
              data.impactDescription,
              Validators.required
            ],
            institutionDescription: [
              data.institutionDescription,
              Validators.required
            ],
            teamDescription: [
              data.teamDescription,
              Validators.required
            ],
            financingDescription: [
              data.financingDescription,
              Validators.required
            ],
            littleSocioEnvironmentalDescription: [
              data.littleSocioEnvironmentalDescription,
              Validators.required
            ],
            detailedSocioEnvironmentalDescription: [
              data.detailedSocioEnvironmentalDescription,
              Validators.required
            ],
            maxAmount: [
              data.maxAmount,
              Validators.required
            ],
            minAmount: [
              data.minAmount,
              Validators.required
            ],
            projectRate: [
              data.rate,
              Validators.required
            ],
            position: [
              data.position,
              Validators.required
            ],
            categoryId: [
              data.category.id,
              Validators.required
            ],
            subCategories: [
              '',
              Validators.required
            ],
            areaId: [
              data.area.id,
              Validators.required
            ],
            objectives: [
              '',
              Validators.required
            ],
            isActive: [data.isActive],
            statusId: [
              data.status.id,
              Validators.required
            ]
          });

          resolve();
        },
        error: (err) => {
          console.error('Error al obtener el proyecto', err);
          reject(err);
        }
      });
    });
  }

  submit() {
    const payload = {
      ...this.investmentProjectForm.getRawValue()
    };
    payload['subCategories'] = '[' + payload['subCategories'].join(',') + ']';
    payload['objectives'] = '[' + payload['objectives'].join(',') + ']';
    console.log(payload);
    this.organizationService.updateInvestmentProjects(this.idProject, payload).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
