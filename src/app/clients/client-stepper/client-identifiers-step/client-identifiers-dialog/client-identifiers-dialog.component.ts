import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-client-identifiers-dialog',
  templateUrl: './client-identifiers-dialog.component.html',
  styleUrls: ['./client-identifiers-dialog.component.scss']
})
export class ClientIdentifiersDialogComponent implements OnInit {
  /** Add/Edit family member form. */
  identifierForm: UntypedFormGroup;

  /**
   * @param {MatDialogRef} dialogRef Client Family Member Dialog Reference
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {any} data Dialog Data
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    public dialogRef: MatDialogRef<ClientIdentifiersDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.createIdentifierForm();
    if (this.data.context === 'Edit') {
      this.identifierForm.patchValue({
        documentTypeId: this.data.identifier.documentTypeId,
        documentKey: this.data.identifier.documentKey,
        status: this.data.identifier.status,
        description: this.data.identifier.description
      });
    }
  }

  /**
   * Creates Identifier Form
   */
  createIdentifierForm() {
    this.identifierForm = this.formBuilder.group({
      documentTypeId: [
        '',
        Validators.required
      ],
      documentKey: [
        '',
        Validators.required
      ],
      status: [
        '',
        Validators.required
      ],
      description: ['']
    });
  }

  /**
   * Returns Formatted Identifier
   */
  get identifier(): any {
    console;
    const identifierFormData = this.identifierForm.value;
    const identifier = {
      ...identifierFormData
    };
    for (const key in identifier) {
      if (identifier[key] === '' || identifier[key] === undefined) {
        delete identifier[key];
      }
    }
    return identifier;
  }
}
