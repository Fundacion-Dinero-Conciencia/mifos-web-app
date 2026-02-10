import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UploadImageDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-image-dialog/upload-image-dialog.component';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';
import { SettingsService } from 'app/settings/settings.service';
import { OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'mifosx-investment-project-image-tab',
  templateUrl: './investment-project-image-tab.component.html',
  styleUrls: ['./investment-project-image-tab.component.scss']
})
export class InvestmentProjectImageTabComponent implements OnInit {
  imageData: any;
  currency: string;
  coverImage: any;
  projectId: any;
  projectData: any;
  validExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp'
  ];
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private organizationService: OrganizationService,
    private systemService: SystemService
  ) {
    this.projectId = this.route.parent.snapshot.params['id'];

    if (this.projectId) {
      this.getProjectImages();
    }
    this.route.data.subscribe((data: { accountData: any; imageData: any }) => {
      this.projectData = data.accountData;
      this.imageData = data.imageData;
    });
  }

  ngOnInit(): void {
    this.getDefaultCurrency();
  }

  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }

  uploadCoverDocument() {
    this.uploadDocument('Cover');
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
        this.organizationService.uploadProjectDocumentsImage(this.projectId, formData).subscribe((response: any) => {
          this.getProjectImages();
        });
      }
    });
  }

  deleteDocument(imageId: string) {
    this.organizationService.deleteProjectDocumentsImage(this.projectId, imageId).subscribe((response: any) => {
      this.getProjectImages();
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  isValidImage(path: string): boolean {
    if (!path) return false;
    const ext = path.split('.').pop()?.toLowerCase();
    return this.validExtensions.includes(ext ?? '');
  }
  async getProjectImages(): Promise<void> {
    await this.systemService.getObjectDocuments('projects', this.projectId).subscribe((response: any) => {
      if (this.imageData && this.imageData instanceof Array) {
        this.imageData = response;

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

  updateImageOrder(image: any) {
    const formData: FormData = new FormData();
    formData.append('name', image.name);
    formData.append('fileName', image.fileName);
    formData.append('description', image.description);
    this.organizationService
      .updateProjectDocumentsImage(this.projectId, image.id, formData)
      .subscribe((response: any) => {
        this.getProjectImages();
      });
  }

  getImagePath(location: string): string {
    return environment.amazonBucketUrl + location;
  }

  get canEdit() {
    const status = this.projectData?.status?.statusValue?.name;
    return (
      status !== 'Cerrado' &&
      status !== 'Cancelado' &&
      status !== 'Anulado' &&
      status !== 'En curso' &&
      status !== 'En Formalización'
    );
  }
}
