import { FormfieldBase } from './formfield-base';

export class MapsBase extends FormfieldBase {
  controlType = 'maps';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || 'text';
  }
}
