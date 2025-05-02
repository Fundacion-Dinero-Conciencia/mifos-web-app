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
    this.setupInvestmentProjectForm();
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
  }

  setupInvestmentProjectForm() {
    this.investmentProjectForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      subtitle: [
        '',
        Validators.required
      ],
      mnemonic: [
        '',
        Validators.required
      ],
      impactDescription: [
        '',
        Validators.required
      ],
      institutionDescription: [
        '',
        Validators.required
      ],
      teamDescription: [
        '',
        Validators.required
      ],
      financingDescription: [
        '',
        Validators.required
      ],
      littleSocioEnvironmentalDescription: [
        '',
        Validators.required
      ],
      detailedSocioEnvironmentalDescription: [
        '',
        Validators.required
      ],
      maxAmount: [
        0,
        Validators.required
      ],
      minAmount: [
        0,
        Validators.required
      ],
      projectRate: [
        '',
        Validators.required
      ],
      position: [
        '',
        Validators.required
      ],
      categoryId: [
        '',
        Validators.required
      ],
      subCategories: [
        '',
        Validators.required
      ],
      areaId: [
        '',
        Validators.required
      ],
      objectives: [
        '',
        Validators.required
      ],
      isActive: [false],
      statusId: [
        '',
        Validators.required
      ]
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
