import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
@Component({
  selector: 'mifosx-investment-project-notes-tab',
  templateUrl: './investment-project-notes-tab.component.html',
  styleUrls: ['./investment-project-notes-tab.component.scss']
})
export class InvestmentProjectNotesTabComponent implements OnInit {
  noteForm: UntypedFormGroup;
  entityNotes: any[] = [];
  constructor(
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      note: [
        '',
        Validators.required
      ]
    });
  }

  addNote() {
    console.log('note add');
  }
  editNote(noteId: string, noteContent: string, index: number) {
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        formfields: [
          {
            controlName: 'note',
            required: true,
            value: noteContent,
            controlType: 'input',
            label: 'Note'
          }
        ],
        layout: {
          columns: 1,
          addButtonText: 'Confirm'
        },
        title: 'Edit Note'
      }
    });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data && response.data.value.note !== noteContent) {
        console.log('edit');
      }
    });
  }

  deleteNote(noteId: string, index: number) {
    const deleteNoteDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Note: ${this.entityNotes[index].note}` }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        console.log('delete');
      }
    });
  }
}
