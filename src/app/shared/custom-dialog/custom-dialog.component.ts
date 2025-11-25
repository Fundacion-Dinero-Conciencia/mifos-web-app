/** Angular Imports */
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { inputs } from '@syncfusion/ej2-angular-richtexteditor/src/rich-text-editor/richtexteditor.component';

@Component({
  selector: 'mifosx-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent {
  @Input() open = false;

  @Input() heading = '';
  @Input() color: 'primary' | 'accent' | 'warn' | string = 'primary';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() disableConfirm = false;

  @Output() confirm = new EventEmitter<{ confirm: true }>();
  @Output() dismiss = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  /** Cerrar con ESC */
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) this._close('esc');
  }

  onBackdropClick() {
    this._close('backdrop');
  }

  onCancel() {
    this.dismiss.emit();
    this._close('cancel');
  }

  onConfirm() {
    this.confirm.emit({ confirm: true });
    this._close('confirm');
  }

  private _close(_reason: 'esc' | 'backdrop' | 'cancel' | 'confirm') {
    this.open = false;
    this.closed.emit();
  }
}
