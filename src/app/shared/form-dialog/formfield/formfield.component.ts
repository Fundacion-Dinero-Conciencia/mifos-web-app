import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormfieldBase } from './model/formfield-base';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'mifosx-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss']
})
export class FormfieldComponent implements OnInit {
  @Input() form: UntypedFormGroup;
  @Input() formfield: FormfieldBase;

  Editor = ClassicEditor;
  editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      'blockQuote',
      '|',
      'undo',
      'redo',
      '|',
      'alignment',
      'outdent',
      'indent',
      'removeFormat'
    ]
  };

  constructor() {}

  ngOnInit() {
    console.log('Field received in formfield:', this.formfield);
  }
}
