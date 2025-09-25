import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

@Component({
  selector: 'mifosx-investment-project-notes-tab',
  templateUrl: './investment-project-notes-tab.component.html',
  styleUrls: ['./investment-project-notes-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvestmentProjectNotesTabComponent implements OnInit {
  noteForm: UntypedFormGroup;
  entityNotes: any[] = [];
  idProject: any;
  projectData: any;
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { notes: any; accountData: any }) => {
      this.entityNotes = data.notes;
      this.projectData = data.accountData;
    });
  }

  ngOnInit() {
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      note: [
        '',
        Validators.required
      ],
      active: [
        ''
      ]
    });
  }

  addNote() {
    const payload = {
      note: this.noteForm.value.note,
      active: this.noteForm.value.active
    };
    this.organizationService.addNote(this.idProject, payload).subscribe((response: any) => {
      window.location.reload();
    });
  }
  editNote(noteId: string, noteEntity: any, index: number) {
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        formfields: [
          {
            controlName: 'note',
            required: true,
            value: noteEntity.note,
            controlType: 'input',
            label: 'Note'
          },
          {
            controlName: 'active',
            required: false,
            value: noteEntity.active,
            controlType: 'checkbox',
            label: 'Publico'
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
      if (
        response.data &&
        (response.data.value.note !== noteEntity.note || response.data.value.active !== noteEntity.active)
      ) {
        this.entityNotes[index].note = response.data.value.note;
        this.entityNotes[index].active = response.data.value.active;
        this.organizationService.editNote(this.idProject, noteId, response.data.value).subscribe((res: any) => {});
      }
    });
  }
  get canEdit() {
    const status = this.projectData?.status?.statusValue?.name;
    return true;
  }

  deleteNote(noteId: string, index: number) {
    const deleteNoteDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Note: ${this.entityNotes[index].note}` }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteNote(this.idProject, noteId).subscribe((res: any) => {
          window.location.reload();
        });
      }
    });
  }
}
