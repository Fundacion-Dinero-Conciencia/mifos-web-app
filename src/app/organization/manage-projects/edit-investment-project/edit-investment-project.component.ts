import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';
import { UploadImageDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-image-dialog/upload-image-dialog.component';
import { ClientsService } from 'app/clients/clients.service';
import { AlertService } from 'app/core/alert/alert.service';
import { OrganizationService } from 'app/organization/organization.service';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { RichTextBase } from 'app/shared/form-dialog/formfield/model/rich-text-base';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-edit-investment-project',
  templateUrl: './edit-investment-project.component.html',
  styleUrls: ['./edit-investment-project.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditInvestmentProjectComponent implements OnInit {
  /** New Investment Project form */
  investmentProjectFormGeneral: UntypedFormGroup;
  investmentProjectPublication: UntypedFormGroup;
  investmentProjectImpact: UntypedFormGroup;
  filteredCategoryData: any[] = [];
  categoryData: any[] = [];
  filteredSubcategoryData: any[] = [];
  subcategoryData: any[] = [];
  areaData: any[] = [];
  statusData: any[] = [];
  objectivesData: any[] = [];
  idProject: any;
  projectData: any;
  public Editor = ClassicEditor;
  creditTypesData: any[] = [];
  countryData: any[] = [];
  clientsData: any[] = [];
  imageData: any;
  coverImage: any;
  imagesOrder: any[] = [];
  validExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp'
  ];
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private organizationService: OrganizationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private clientsService: ClientsService,
    private systemService: SystemService,
    private alertService: AlertService
  ) {
    this.route.data.subscribe(
      (data: {
        accountData: any;
        categoryData: any;
        subcategoryData: any;
        areaData: any;
        statusData: any;
        objectivesData: any;
        creditTypesData: any;
        countryData: any;
        clientsData: any;
        imageData: any;
      }) => {
        this.filteredCategoryData = [];
        this.categoryData = data.categoryData.codeValues;
        this.filteredSubcategoryData = [];
        this.subcategoryData = data.subcategoryData.codeValues;
        this.areaData = data.areaData.codeValues;
        this.statusData = data.statusData.codeValues;
        this.objectivesData = data.objectivesData.codeValues;
        this.creditTypesData = data.creditTypesData.codeValues;
        this.countryData = data.countryData.codeValues;
        this.clientsData = data.clientsData;
        this.projectData = data.accountData;
        this.imageData = data.imageData;
        this.imageData.forEach((img: any) => {
          this.imagesOrder.push({
            number: this.imageData.description,
            hasChanges: false
          });
        });
      }
    );
  }

  async ngOnInit() {
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
    this.getProjectImages();
    this.setupInvestmentProjectForm(this.idProject);
  }

  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  isValidImage(path: string): boolean {
    if (!path) return false;
    const ext = path.split('.').pop()?.toLowerCase();
    return this.validExtensions.includes(ext ?? '');
  }

  async setupInvestmentProjectForm(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.organizationService.getInvestmentProject(id).subscribe({
        next: (data) => {
          this.setArea(data?.area?.id);
          this.setCategory(data?.category?.id);
          this.investmentProjectFormGeneral = this.formBuilder.group({
            countryId: [
              data.country?.id,
              Validators.required
            ],
            ownerId: [
              data.ownerName,
              Validators.required
            ],
            name: [
              data?.name,
              Validators.required
            ],
            mnemonic: [
              data?.mnemonic,
              Validators.required
            ],
            statusId: [
              data?.status?.statusValue?.id,
              Validators.required
            ]
          });
          this.investmentProjectPublication = this.formBuilder.group({
            institutionDescription: [
              data.institutionDescription,
              Validators.required
            ],
            teamDescription: [
              data?.teamDescription,
              Validators.required
            ],
            financingDescription: [
              data?.financingDescription
            ],
            position: [
              data?.position
            ],
            maxAmount: [
              data?.maxAmount,
              [
                Validators.required,
                Validators.min(0)]
            ],
            minAmount: [
              data?.minAmount,
              [
                Validators.required,
                Validators.min(0)]
            ],
            isActive: [data.isActive]
          });
          this.investmentProjectImpact = this.formBuilder.group({
            impactDescription: [
              data?.impactDescription,
              Validators.required
            ],
            littleSocioEnvironmentalDescription: [
              data?.littleSocioEnvironmentalDescription,
              Validators.required
            ],
            areaId: [
              data?.area?.id,
              Validators.required
            ],
            categoryId: [
              data?.category?.id,
              Validators.required
            ],
            subCategories: [
              data?.subCategories?.map((o: any) => o.category.id) || []
            ],
            objectives: [
              data?.objectives?.map((o: any) => o.objective.id) || []
            ]
          });
          this.investmentProjectFormGeneral.get('ownerId')?.disable();
          this.investmentProjectFormGeneral.get('mnemonic')?.disable();
          this.investmentProjectFormGeneral.get('countryId')?.disable();
          if (this.projectData?.status?.statusValue?.name.includes('En Financiamiento')) {
            this.investmentProjectFormGeneral.disable();
            this.investmentProjectFormGeneral.get('name')?.enable();
            this.investmentProjectFormGeneral.get('statusId')?.enable();
            this.investmentProjectPublication.disable();
            this.investmentProjectImpact.disable();
          } else if (!this.canEdit()) {
            this.investmentProjectFormGeneral.disable();
            this.investmentProjectFormGeneral.get('statusId')?.enable();
            this.investmentProjectPublication.disable();
            this.investmentProjectImpact.disable();
          }
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
    const rawGeneralFormValues = this.investmentProjectFormGeneral.getRawValue();
    const rawPublicationFormValues = this.investmentProjectPublication.getRawValue();
    const rawImpactFormValues = this.investmentProjectImpact.getRawValue();
    // const payload = {
    //   ...this.investmentProjectForm.getRawValue()
    // };
    const payload = Object.entries({
      name: rawGeneralFormValues.name,
      statusId: rawGeneralFormValues.statusId,
      mnemonic: rawGeneralFormValues.mnemonic,
      ...rawPublicationFormValues,
      ...rawImpactFormValues,
      projectRate: 10
    }).reduce(
      (acc, [
          key,
          value
        ]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as any
    );

    if (payload['subCategories'] && Array.isArray(payload['subCategories']) && payload['subCategories'].length > 0) {
      payload['subCategories'] = '[' + payload['subCategories'].join(',') + ']';
    }
    if (payload['objectives'] && Array.isArray(payload['objectives']) && payload['objectives'].length > 0) {
      payload['objectives'] = '[' + payload['objectives'].join(',') + ']';
    }
    this.organizationService.updateInvestmentProjects(this.idProject, payload).subscribe((response: any) => {
      this.alertService.alert({
        type: 'Success',
        message: this.translateService.instant('labels.heading.Saved Successfully')
      });
      this.router.navigate(['../general'], { relativeTo: this.route });
    });
  }
  uploadCoverDocument() {
    this.uploadDocument('Cover');
  }

  deleteDocument(imageId: string) {
    this.organizationService.deleteProjectDocumentsImage(this.idProject, imageId).subscribe((response: any) => {
      this.getProjectImages();
    });
  }

  async getProjectImages(): Promise<void> {
    await this.systemService.getObjectDocuments('projects', this.idProject).subscribe((response: any) => {
      if (this.imageData && this.imageData instanceof Array) {
        this.imageData = response;
        this.imageData.forEach((img: any) => {
          this.imagesOrder.push({
            number: this.imageData.description,
            hasChanges: false
          });
        });
        this.coverImage = this.imageData.find((img: any) => img.description === 'Cover') || null;

        //Order images depends on position
        this.imageData.sort((a: { description: string }, b: { description: string }) => {
          const aNum = Number(a.description?.trim());
          const bNum = Number(b.description?.trim());

          if (isNaN(aNum) && !isNaN(bNum)) return 1;

          if (!isNaN(aNum) && isNaN(bNum)) return -1;

          if (isNaN(aNum) && isNaN(bNum)) return 0;

          return aNum - bNum;
        });
      }
    });
  }

  uploadDocument(description: any) {
    const uploadDocumentDialogRef = this.dialog.open(UploadImageDialogComponent, {
      data: { documentIdentifier: false, entityType: '' }
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.name);
        formData.append('fileName', dialogResponse.name);
        formData.append('file', dialogResponse);
        formData.append('description', description);
        this.organizationService.uploadProjectDocumentsImage(this.idProject, formData).subscribe((response: any) => {
          this.getProjectImages();
        });
      }
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
    this.filteredCategoryData = filtered;
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

  openRichTextEditor(fieldName: string) {
    const data = {
      formfields: [
        new RichTextBase({
          controlName: fieldName,
          label: this.translateService.instant(`labels.inputs.custom.${this.toLabelKey(fieldName)}`),
          value:
            this.investmentProjectFormGeneral?.controls?.[fieldName]?.value ||
            this.investmentProjectPublication?.controls?.[fieldName]?.value ||
            this.investmentProjectImpact?.controls?.[fieldName]?.value,
          required: true,
          order: 1
        })

      ],
      showMap: false
    };

    const dialogRef = this.dialog.open(FormDialogComponent, { data });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data?.value?.[fieldName]) {
        this.investmentProjectFormGeneral.controls?.[fieldName]?.setValue(response.data.value[fieldName]);
        this.investmentProjectPublication.controls?.[fieldName]?.setValue(response.data.value[fieldName]);
        this.investmentProjectImpact.controls?.[fieldName]?.setValue(response.data.value[fieldName]);
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

  updateImageOrder(index: number) {
    const image = this.imageData[index];
    const formData: FormData = new FormData();
    formData.append('name', image.name);
    formData.append('fileName', image.fileName);
    formData.append('description', this.imagesOrder[index].number);
    this.organizationService
      .updateProjectDocumentsImage(this.idProject, image.id, formData)
      .subscribe((response: any) => {
        this.getProjectImages();
      });
  }

  canEdit(): boolean {
    const status = this.projectData?.status?.statusValue?.name;
    return (
      status !== 'Cerrado' &&
      status !== 'Cancelado' &&
      status !== 'Anulado' &&
      status !== 'En curso' &&
      status !== 'En Formalización' &&
      status !== 'En Financiamiento'
    );
  }

  getImagePath(location: string): string {
    return 'https://bucketfinedev.s3.amazonaws.com/' + location;
  }
  inputOrderChange(e: InputEvent, index: number) {
    const value = (e.target as HTMLInputElement).value;
    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
      this.imagesOrder[index].number = numberValue;
    }
  }
}
