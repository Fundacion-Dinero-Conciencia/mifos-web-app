import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'mifosx-investment-project-documents-tab',
  templateUrl: './investment-project-documents-tab.component.html',
  styleUrls: ['./investment-project-documents-tab.component.scss']
})
export class InvestmentProjectTabComponent implements OnInit {
  @ViewChild('documentsTable', { static: true }) documentsTable: MatTable<Element>;

  @Input() InvestmentType: string;
  @Input() InvestmentDocuments: any;

  @Input() callbackUpload: (documentData: FormData) => Observable<any>;
  @Input() callbackDownload: (documentId: string) => void;
  @Input() callbackDelete: (documentId: string) => void;

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
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
      this.InvestmentId = data.accountData.id;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.InvestmentDocuments);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  downloadDocument(documentId: string) {
    this.callbackDownload(documentId);
  }

  uploadDocument() {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: {
        documentIdentifier: false,
        entityType: '',
        documentClassOptions: this.customerDocumentOptions,
        documentTypeOptions: this.documentTypeOptions
      }
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        formData.append('description', dialogResponse.description);
        formData.append('documentClassId', dialogResponse.documentClassId);
        formData.append('documentTypeId', dialogResponse.documentTypeId);
        this.callbackUpload(formData).subscribe((res: any) => {
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
        this.callbackDelete(documentId);
        for (let i = 0; i < this.InvestmentDocuments.length; i++) {
          if (this.InvestmentDocuments[i].id === documentId) {
            this.InvestmentDocuments.splice(i, 1);
          }
        }
        this.documentsTable.renderRows();
      }
    });
  }
}
