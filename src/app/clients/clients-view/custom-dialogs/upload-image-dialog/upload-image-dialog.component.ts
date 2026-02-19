/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject, OnInit } from '@angular/core';

/**
 * Upload image dialog component.
 */
@Component({
  selector: 'mifosx-upload-image-dialog',
  templateUrl: './upload-image-dialog.component.html',
  styleUrls: ['./upload-image-dialog.component.scss']
})
export class UploadImageDialogComponent implements OnInit {
  /** Client Image */
  image: File | File[] | null = null;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(
    public dialogRef: MatDialogRef<UploadImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */

  ngOnInit() {
    console.log(this.data);
  }

  onFileSelect(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    if (this.data.multiple) {
      this.image = Array.from(files);
    } else {
      this.image = files[0];
    }
  }
}
