import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FormfieldBase } from './model/formfield-base';
@Component({
  selector: 'mifosx-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss']
})
export class FormfieldComponent implements AfterViewInit {
  @Input() form: UntypedFormGroup;
  @Input() formfield: FormfieldBase;
  @ViewChild('addressPicker') addressPicker!: ElementRef;
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

  ngAfterViewInit() {
    if (this.formfield.controlType === 'maps') {
      setTimeout(() => {
        const value = this.form.controls[this.formfield.controlName].value;
        if (value && this.addressPicker?.nativeElement) {
          const component = this.addressPicker.nativeElement;
          const shadow = component.shadowRoot;
          const inputEl = shadow?.querySelector('input');
          inputEl.value = value;
        }
      }, 50);
    }
  }
  onPlaceChanged(event: any, controlName: string): void {
    let address: string | null = null;
    const component = event.target;
    const shadow = component.shadowRoot;
    const inputEl = shadow?.querySelector('input');
    if (inputEl?.value) {
      address = inputEl?.value;
    } else if (event?.detail?.place) {
      const place = event.detail.place;
      address = place.formattedAddress || place.formatted_address || place.name;
    }

    if (!address) {
      return;
    }

    const control = this.form.get(controlName);
    control?.setValue(address);
    control?.markAsDirty();
    control?.markAsTouched();
  }
}
