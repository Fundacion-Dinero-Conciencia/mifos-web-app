import { FormfieldBase } from './formfield-base';

export class RichTextBase extends FormfieldBase {
  controlType = 'richtext';
  type = 'richtext';

  constructor(options: any = {}) {
    super(options);
  }
}
