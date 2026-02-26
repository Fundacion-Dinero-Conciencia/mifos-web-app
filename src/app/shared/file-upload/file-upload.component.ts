/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

/**
 * Custom file upload component based on angular material.
 */
@Component({
  selector: 'mifosx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  /** Form field flex dimension */
  @Input() flex: any;
  @Input() acceptFilter: string;
  @Input() multiple: boolean = false;

  /** Selected file name */
  fileName: any = '';

  constructor() {}

  ngOnInit() {
    if (!this.acceptFilter) {
      this.acceptFilter = '.xls,.xlsx,.pdf,.doc,.docx,.png,.jpeg,.jpg';
    }
  }

  /**
   * Sets the file name.
   * @param {any} event File input change event.
   */
  onFileSelect($event: any) {
    if (this.multiple) {
      this.fileName = Array.from($event.target.files)
        .map((file: any) => file.name)
        .join(', ');
      return;
    }
    this.fileName = $event.target.files[0].name;
  }
}
