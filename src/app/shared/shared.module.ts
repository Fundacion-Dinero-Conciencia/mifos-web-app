/** Angular Imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Custom Components */
import { CancelDialogComponent } from './cancel-dialog/cancel-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { DisableDialogComponent } from './disable-dialog/disable-dialog.component';
import { EnableDialogComponent } from './enable-dialog/enable-dialog.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FooterComponent } from './footer/footer.component';
import { FormDialogComponent } from './form-dialog/form-dialog.component';
import { FormfieldComponent } from './form-dialog/formfield/formfield.component';
import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { NotificationsTrayComponent } from './notifications-tray/notifications-tray.component';
import { SearchToolComponent } from './search-tool/search-tool.component';
import { ServerSelectorComponent } from './server-selector/server-selector.component';
import { TenantSelectorComponent } from './tenant-selector/tenant-selector.component';
import { ThemePickerComponent } from './theme-picker/theme-picker.component';

/** Custom Modules */
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslateModule } from '@ngx-translate/core';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { DirectivesModule } from 'app/directives/directives.module';
import { PipesModule } from 'app/pipes/pipes.module';
import { AccountNumberComponent } from './account-number/account-number.component';
import { GlAccountDisplayComponent } from './accounting/gl-account-display/gl-account-display.component';
import { GlAccountSelectorComponent } from './accounting/gl-account-selector/gl-account-selector.component';
import { ViewJournalEntryTransactionComponent } from './accounting/view-journal-entry-transaction/view-journal-entry-transaction.component';
import { ViewJournalEntryComponent } from './accounting/view-journal-entry/view-journal-entry.component';
import { ViewSavingsAccountingDetailsComponent } from './accounting/view-savings-accounting-details/view-savings-accounting-details.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { EntityNameComponent } from './entity-name/entity-name.component';
import { ExternalIdentifierComponent } from './external-identifier/external-identifier.component';
import { IconsModule } from './icons.module';
import { InputAmountComponent } from './input-amount/input-amount.component';
import { InputPasswordComponent } from './input-password/input-password.component';
import { LongTextComponent } from './long-text/long-text.component';
import { MaterialModule } from './material.module';
import { StepperButtonsComponent } from './steppers/stepper-buttons/stepper-buttons.component';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
import { DatatableMultiRowComponent } from './tabs/entity-datatable-tab/datatable-multi-row/datatable-multi-row.component';
import { DatatableSingleRowComponent } from './tabs/entity-datatable-tab/datatable-single-row/datatable-single-row.component';
import { EntityDatatableTabComponent } from './tabs/entity-datatable-tab/entity-datatable-tab.component';
import { EntityDocumentsTabComponent } from './tabs/entity-documents-tab/entity-documents-tab.component';
import { EntityNotesTabComponent } from './tabs/entity-notes-tab/entity-notes-tab.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { TransactionPaymentDetailComponent } from './transaction-payment-detail/transaction-payment-detail.component';

/**
 * Shared Module
 *
 * Modules and components that are shared throughout the application should be here.
 */
@NgModule({
  imports: [
    CommonModule,
    IconsModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    DirectivesModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    RichTextEditorModule,
    CKEditorModule
  ],
  declarations: [
    FormfieldComponent,
    FormDialogComponent,
    DeleteDialogComponent,
    CancelDialogComponent,
    FileUploadComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ThemePickerComponent,
    ChangePasswordDialogComponent,
    EnableDialogComponent,
    DisableDialogComponent,
    ConfirmationDialogComponent,
    CustomDialogComponent,
    KeyboardShortcutsDialogComponent,
    ErrorDialogComponent,
    NotificationsTrayComponent,
    SearchToolComponent,
    ServerSelectorComponent,
    TenantSelectorComponent,
    ExternalIdentifierComponent,
    EntityNotesTabComponent,
    EntityDocumentsTabComponent,
    EntityDatatableTabComponent,
    DatatableSingleRowComponent,
    DatatableMultiRowComponent,
    SvgIconComponent,
    ViewJournalEntryComponent,
    ViewJournalEntryTransactionComponent,
    AccountNumberComponent,
    EntityNameComponent,
    TransactionPaymentDetailComponent,
    StepperButtonsComponent,
    GlAccountSelectorComponent,
    GlAccountDisplayComponent,
    ViewSavingsAccountingDetailsComponent,
    ThemeToggleComponent,
    LongTextComponent,
    DropdownComponent,
    InputAmountComponent,
    InputPasswordComponent
  ],
  exports: [
    CustomDialogComponent,
    FileUploadComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ServerSelectorComponent,
    ThemePickerComponent,
    NotificationsTrayComponent,
    SearchToolComponent,
    ErrorDialogComponent,
    CommonModule,
    IconsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TenantSelectorComponent,
    ExternalIdentifierComponent,
    AccountNumberComponent,
    EntityNotesTabComponent,
    EntityDocumentsTabComponent,
    EntityDatatableTabComponent,
    ViewJournalEntryComponent,
    ViewJournalEntryTransactionComponent,
    SvgIconComponent,
    EntityNameComponent,
    TransactionPaymentDetailComponent,
    StepperButtonsComponent,
    GlAccountSelectorComponent,
    GlAccountDisplayComponent,
    ViewSavingsAccountingDetailsComponent,
    ThemeToggleComponent,
    LongTextComponent,
    DropdownComponent,
    InputAmountComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
