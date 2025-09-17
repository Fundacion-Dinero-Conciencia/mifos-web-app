import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { OrganizationService } from 'app/organization/organization.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-investment-project-documents-tab',
  templateUrl: './investment-project-documents-tab.component.html',
  styleUrls: ['./investment-project-documents-tab.component.scss']
})
export class InvestmentProjectTabComponent implements OnInit {
  @ViewChild('documentsTable', { static: true }) documentsTable: MatTable<Element>;

  @Input() InvestmentType: string;
  @Input() InvestmentDocuments: any;

  searchText = new UntypedFormControl('');
  projectData: any;
  InvestmentId: string;
  customerDocumentOptions: any = [];
  documentTypeOptions: any = [];

  /** Status of the loan account */
  status: any;
  /** Choice */
  choice: boolean;

  /** Columns to be displayed in loan documents table. */
  displayedColumns: string[] = [
    'name',
    'description',
    'filename',
    'documentClass',
    'documentType',
    'actions'
  ];
  /** Data source for loan documents table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for codes table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for codes table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   *
   * @param {MatDialog} dialog Dialog for Inputs.
   * @param {SavingsService} savingsService Savings Account services.
   * @param {LoansService} loansService Loan Account services.
   * @param {ClientsService} clientsService Client services.
   */
  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private organizationService: OrganizationService
  ) {
    this.route.data.subscribe(
      (data: {
        accountData: any;
        InvestmentDocuments: any;
        documentTypeOptions: any;
        customerDocumentOptions: any;
      }) => {
        this.projectData = data.accountData;
        this.InvestmentId = data.accountData.id;
        this.InvestmentDocuments = data.InvestmentDocuments.filter((doc: any) => !!doc.documentClass);
        this.customerDocumentOptions = data.customerDocumentOptions;
        this.documentTypeOptions = data.documentTypeOptions;
      }
    );
  }

  validExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp'
  ];

  isImage(path: string): boolean {
    if (!path) return false;
    const ext = path.split('.').pop()?.toLowerCase();
    return this.validExtensions.includes(ext ?? '');
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.InvestmentDocuments);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  downloadDocument(documentId: string) {
    this.organizationService.downladProjectDocumentsImage(this.InvestmentId, documentId).subscribe((res) => {
      const url = window.URL.createObjectURL(res as Blob);
      return window.open(url);
    });
  }

  uploadDocument() {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: {
        documentIdentifier: false,
        entityType: '',
        documentClassOptions: this.customerDocumentOptions,
        documentTypeOptions: this.documentTypeOptions,
        description: 'Documento'
      }
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        console.log(dialogResponse);
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        formData.append('description', dialogResponse.description);
        formData.append('documentClassId', dialogResponse.documentClassId);
        formData.append('documentTypeId', dialogResponse.documentTypeId);
        this.organizationService.addProjectDocuments(this.InvestmentId, formData).subscribe((res: any) => {
          this.InvestmentDocuments.push({
            id: res.resourceId,
            parentEntityType: this.InvestmentType,
            parentEntityId: this.InvestmentId,
            name: dialogResponse.fileName,
            description: dialogResponse.description,
            fileName: dialogResponse.file.name,
            documentClassId: dialogResponse.documentClassId,
            documentTypeId: dialogResponse.documentTypeId
          });
          this.documentsTable.renderRows();
        });
      }
    });
  }

  deleteDocument(documentId: string, name: number) {
    const deleteDocumentDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Document: ${name}` }
    });
    deleteDocumentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteProjectDocumentsImage(this.InvestmentId, documentId);
        for (let i = 0; i < this.InvestmentDocuments.length; i++) {
          if (this.InvestmentDocuments[i].id === documentId) {
            this.InvestmentDocuments.splice(i, 1);
          }
        }
        this.documentsTable.renderRows();
      }
    });
  }

  filter(e: InputEvent) {
    const filterValue = (e.target as HTMLInputElement).value.toLowerCase();

    this.dataSource.data = this.InvestmentDocuments.filter((doc: any) =>
      doc.fileName.toLowerCase().includes(filterValue)
    );
  }
}
