import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { RichTextBase } from 'app/shared/form-dialog/formfield/model/rich-text-base';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-create-investment-project',
  templateUrl: './create-investment-project.component.html',
  styleUrls: ['./create-investment-project.component.scss']
})
export class CreateInvestmentProjectComponent implements OnInit, AfterViewInit {
  /** New Investment Project form */
  investmentProjectForm: UntypedFormGroup;
  clientsData: any[] = [];
  loansData: any[] = [];
  countryData: any[] = [];
  categoryData: any[] = [];
  subcategoryData: any[] = [];
  areaData: any[] = [];
  currency: any;
  statusData: any[] = [];
  objectivesData: any[] = [];
  public Editor = ClassicEditor;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private clientsService: ClientsService,
    private organizationService: OrganizationService,
    private translateService: TranslateService,
    private systemService: SystemService
  ) {
    this.route.data.subscribe(
      (data: {
        countryData: any;
        categoryData: any;
        subcategoryData: any;
        areaData: any;
        statusData: any;
        objectivesData: any;
      }) => {
        this.clientsData = [];
        this.countryData = data.countryData.codeValues;
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
    this.loansData = [];
    this.getDefaultCurrency();
  }

  ngAfterViewInit() {
    this.investmentProjectForm.controls.ownerId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
          this.clientsData = data.pageItems;
        });
      }
    });
  }

  setupInvestmentProjectForm() {
    this.investmentProjectForm = this.formBuilder.group({
      countryId: [
        '',
        Validators.required
      ],
      ownerId: [
        0,
        Validators.required
      ],
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
      amount: [
        0,
        Validators.required
      ],
      projectRate: [
        '',
        Validators.required
      ],
      period: [
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
      isActive: [false],
      statusId: [
        '',
        Validators.required
      ],
      objectives: [
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
      position: [
        0,
        Validators.required
      ]
    });
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  submit() {
    const currencyCode: string = this.currency;

    const payload = {
      ...this.investmentProjectForm.getRawValue(),
      currencyCode
    };
    const owner: any = payload['ownerId'];
    payload['ownerId'] = owner['id'];
    payload['amount'] = payload['amount'] * 1;
    payload['subCategories'] = '[' + payload['subCategories'].join(',') + ']';
    payload['objectives'] = '[' + payload['objectives'].join(',') + ']';
    console.log(payload);
    this.organizationService.createInvestmentProjects(payload).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  openRichTextEditor(fieldName: string) {
    const data = {
      formfields: [
        new RichTextBase({
          controlName: fieldName,
          label: this.translateService.instant(`labels.inputs.custom.${this.toLabelKey(fieldName)}`),
          value: this.investmentProjectForm.controls[fieldName].value,
          required: true,
          order: 1
        })

      ],
      showMap: false
    };

    const dialogRef = this.dialog.open(FormDialogComponent, { data });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data?.value?.[fieldName]) {
        this.investmentProjectForm.controls[fieldName].setValue(response.data.value[fieldName]);
      }
    });
  }

  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }

  toLabelKey(fieldName: string): string {
    switch (fieldName) {
      case 'impactDescription':
        return 'Impact Description';
      case 'institutionDescription':
        return 'Institution Description';
      case 'teamDescription':
        return 'Team Description';
      case 'financingDescription':
        return 'Financial Description';
      case 'littleSocioEnvironmentalDescription':
        return 'Socio Environmental Description';
      case 'detailedSocioEnvironmentalDescription':
        return 'Detailed Socio Environmental Description';
      default:
        return fieldName;
    }
  }
}
