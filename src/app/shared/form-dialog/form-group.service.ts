import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { FormfieldBase } from './formfield/model/formfield-base';
import { DocumentValidatorService } from 'app/core/utils/documentValidator';

@Injectable({
  providedIn: 'root'
})
export class FormGroupService {
  constructor(private docValidator: DocumentValidatorService) {}

  createFormGroup(formfields: FormfieldBase[]) {
    const group: any = {};

    formfields.forEach((formfield) => {
      const validators = [];

      // requerido
      if (formfield.required) {
        validators.push(Validators.required);
      }

      if (formfield.controlName === 'documentKey') {
        validators.push((control: AbstractControl) => {
          const value = control.value;
          const documentTypeId = control?.parent?.get('documentTypeId')?.value;

          if (!value) return { documentInvalid: true };

          if (documentTypeId === 1) {
            const result = this.docValidator.validate(value);
            return result ? null : { documentInvalid: true };
          }

          return null;
        });
      }

      group[formfield.controlName] = new UntypedFormControl(formfield.value, validators);
    });

    return new UntypedFormGroup(group);
  }
}
