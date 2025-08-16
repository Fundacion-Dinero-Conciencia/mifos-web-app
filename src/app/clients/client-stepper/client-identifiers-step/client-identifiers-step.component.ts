import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ClientIdentifiersDialogComponent } from './client-identifiers-dialog/client-identifiers-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-client-identifiers-step',
  templateUrl: './client-identifiers-step.component.html',
  styleUrls: ['./client-identifiers-step.component.scss']
})
export class ClientIdentifiersStepComponent {
  /** Cient Template */
  @Input() clientTemplate: any;
  /** Client Identifiers */
  clientIdentifiers: any[] = [];

  /**
   * @param {MatDialog} dialog Mat Dialog
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.clientIdentifiers = [];
  }

  /**
   * Adds a identifier.
   */
  addIdentifier() {
    const addIdentifierDialogRef = this.dialog.open(ClientIdentifiersDialogComponent, {
      data: {
        context: this.translateService.instant('labels.buttons.Add'),
        options: this.clientTemplate.documentTypeIdOptions
      },
      width: '25rem'
    });
    addIdentifierDialogRef.afterClosed().subscribe((response: any) => {
      if (response.identifier) {
        console.log('identifier: ', response.identifier);
        this.clientIdentifiers.push(response.identifier);
      }
    });
  }

  /**
   * Edits the Identifier.
   * @param {any} identifier Identifier
   * @param {any} index Tree Index
   */
  editIdentifier(identifier: any, index: any) {
    const addFamilyMemberDialogRef = this.dialog.open(ClientIdentifiersDialogComponent, {
      data: {
        context: 'Edit',
        identifier: identifier,
        options: this.clientTemplate.documentTypeIdOptions
      },
      width: '25rem'
    });
    addFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.identifier) {
        this.clientIdentifiers.splice(index, 1, response.identifier);
      }
    });
  }

  /**
   * Deletes the Identifer
   */
  deleteIdentifier(name: string, index: number) {
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Identifer name : ${name} ${index}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientIdentifiers.splice(index, 1);
      }
    });
  }

  /**
   * Returns the array of client identifiers.
   */
  get identifiers() {
    return { identifiers: this.clientIdentifiers };
  }
}
