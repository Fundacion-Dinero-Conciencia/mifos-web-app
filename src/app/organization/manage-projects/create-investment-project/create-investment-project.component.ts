import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from 'app/clients/clients.service';
import { LoansService } from 'app/loans/loans.service';
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
  filtereCategoryData: any[] = [];
  subcategoryData: any[] = [];
  filteredSubcategoryData: any[] = [];
  areaData: any[] = [];
  currency: any;
  statusData: any[] = [];
  creditTypesData: any[] = [];
  loanPurposeData: any[] = [];
  objectivesData: any[] = [];
  loanProductsData: any[] = [];
  termFrequencyTypeData: any[] = [];
  public Editor = ClassicEditor;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private clientsService: ClientsService,
    private organizationService: OrganizationService,
    private translateService: TranslateService,
    private systemService: SystemService,
    private loanService: LoansService
  ) {
    this.route.data.subscribe(
      (data: {
        countryData: any;
        categoryData: any;
        subcategoryData: any;
        areaData: any;
        statusData: any;
        objectivesData: any;
        loanProductsData: any;
        creditTypesData: any;
        loanPurposeData: any;
      }) => {
        this.clientsData = [];
        this.countryData = data.countryData.codeValues;
        this.categoryData = data.categoryData.codeValues;
        this.filtereCategoryData = [];
        this.filteredSubcategoryData = [];
        this.subcategoryData = data.subcategoryData.codeValues;
        this.areaData = data.areaData.codeValues;
        this.statusData = data.statusData.codeValues;
        this.objectivesData = data.objectivesData.codeValues;
        this.loanProductsData = data.loanProductsData;
        this.creditTypesData = data.creditTypesData.codeValues;
        this.loanPurposeData = data.loanPurposeData.codeValues;
      }
    );
  }

  ngOnInit(): void {
    this.setupInvestmentProjectForm();
    this.loansData = [];
    this.getDefaultCurrency();
    // this.investmentProjectForm.get('basedInLoanProductId')?.valueChanges.subscribe(value => {
    //   this.getTermFrequency(value);
    // });
  }

  getTermFrequency(value: string) {
    const entityId = this.investmentProjectForm.get('ownerId')?.value.id;
    this.loanService.getLoansAccountTemplateResource(entityId, false, value).subscribe((response: any) => {
      this.termFrequencyTypeData = response.repaymentFrequencyTypeOptions;
    });
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
    const ownerId = history.state?.ownerId;
    const ownerName = history.state?.ownerName;
    const ownerMnemonic = history.state?.mnemonic;
    const owner = {
      id: ownerId,
      displayName: ownerName,
      mnemonic: ownerMnemonic
    };
    this.investmentProjectForm = this.formBuilder.group({
      countryId: [
        '',
        Validators.required
      ],
      ownerId: [
        owner || 0,
        Validators.required
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(30)]
      ],
      // RUT: [
      //   '',
      //   Validators.required
      // ],
      // subtitle: [
      //   ''
      // ],
      mnemonic: [
        '',
        [
          Validators.required,
          Validators.maxLength(3)]
      ],
      // impactDescription: [
      //   ''
      // ],
      // institutionDescription: [
      //   ''
      // ],
      // teamDescription: [
      //   ''
      // ],
      // financingDescription: [
      //   ''
      // ],
      // littleSocioEnvironmentalDescription: [
      //   ''
      // ],
      // detailedSocioEnvironmentalDescription: [
      //   ''
      // ],
      // amount: [
      //   0
      // ],
      // projectRate: [
      //   ''
      // ],
      // period: [
      //   ''
      // ],
      // categoryId: [
      //   ''
      // ],
      // subCategories: [
      //   ''
      // ],
      // areaId: [
      //   ''
      // ],
      // isActive: [false],
      statusId: [
        '',
        Validators.required
      ],
      // objectives: [
      //   ''
      // ],
      // maxAmount: [
      //   0
      // ],
      // minAmount: [
      //   0
      // ],
      // position: [
      //   1
      // ],
      // creditTypeId: [
      //   ''
      // ],
      loanPurposeId: [
        '',
        Validators.required
      ]
    });
    const defaultStatus = this.statusData.find((s) => s.name === 'En Borrador');
    if (defaultStatus) {
      this.investmentProjectForm.patchValue({ statusId: defaultStatus.id });
    }
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
    // const currencyCode: string = this.currency;

    const payload = {
      ...this.investmentProjectForm.getRawValue()
      // currencyCode
    };
    const owner: any = payload['ownerId'];
    payload['ownerId'] = owner['id'];
    // payload['amount'] = payload['amount'] * 1;
    if (Array.isArray(payload['subCategories']) && payload['subCategories'].length > 0) {
      payload['subCategories'] = '[' + payload['subCategories'].join(',') + ']';
    }

    if (Array.isArray(payload['objectives']) && payload['objectives'].length > 0) {
      payload['objectives'] = '[' + payload['objectives'].join(',') + ']';
    }

    payload['mnemonic'] = this.investmentProjectForm.controls.ownerId.value?.mnemonic + payload['mnemonic'];
    this.organizationService.createInvestmentProjects(payload).subscribe((response: any) => {
      this.router.navigate([`../${response.resourceId}/general`], { relativeTo: this.route });
    });
  }

  setArea(areaValue: any) {
    const filtered = this.categoryData.filter((a) => {
      try {
        const desc = JSON.parse(a.description);
        return desc.area === areaValue;
      } catch (e) {
        return null;
      }
    });
    this.filtereCategoryData = filtered;
  }

  setCategory(categoryValue: any) {
    const filtered = this.subcategoryData.filter((c) => {
      try {
        const desc = JSON.parse(c.description);
        return desc.category === categoryValue;
      } catch (e) {
        return null;
      }
    });
    this.filteredSubcategoryData = filtered;
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
      const responseField = response?.data?.value?.[fieldName];
      if (responseField) {
        const responseFieldFormatted = responseField.replace(/&nbsp;/g, ' ').trim();
        this.investmentProjectForm.controls[fieldName].setValue(responseFieldFormatted);
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
