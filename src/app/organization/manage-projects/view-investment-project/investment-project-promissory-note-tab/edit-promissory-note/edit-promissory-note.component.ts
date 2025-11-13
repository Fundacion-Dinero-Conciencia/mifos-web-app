import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { SystemService } from 'app/system/system.service';
import { debounceTime, finalize } from 'rxjs/operators';

@Component({
  selector: 'mifosx-edit-promissory-note',
  templateUrl: './edit-promissory-note.component.html',
  styleUrls: ['./edit-promissory-note.component.scss'],
  providers: [CurrencyPipe]
})
export class EditPromissoryNoteComponent implements OnInit {
  descriptionHtml: SafeHtml;
  loading = false;
  projectData: any;
  currency: string;
  clientClassificationTypeOptions: any;
  PromissoryNoteGroup: any;
  selectedInvestments: any[] = [];
  selectedSignators: any[] = [];
  othersGroups: any[];

  clientForm: UntypedFormGroup;
  filters: UntypedFormGroup;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceLegal: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceAval: MatTableDataSource<any> = new MatTableDataSource<any>();

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();

  allowToEdit = true;

  displayedColumns: string[] = [
    'Investor',
    'Date',
    'Value invested',
    'Group'
  ];
  displayedColumnsLegal: string[] = [
    'add',
    'RUT',
    'name',
    'lastName'
  ];
  displayedColumnsAval: string[] = [
    'add',
    'RUT',
    'name',
    'lastName',
    'adress'
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private systemService: SystemService,
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private currencyPipe: CurrencyPipe,
    private clientService: ClientsService,
    private router: Router,
    private settingsService: SettingsService,
    public datePipe: DatePipe
  ) {
    this.route.data.subscribe((data: { accountData: any; PromissoryNoteGroup: any; clientTemplate: any }) => {
      this.projectData = data.accountData;
      this.clientClassificationTypeOptions = data.clientTemplate.clientClassificationOptions;
      this.PromissoryNoteGroup = data.PromissoryNoteGroup;
      this.dataSource.data = this.PromissoryNoteGroup.investmentList;
      this.selectedSignators = data.PromissoryNoteGroup.signatorList.map((signator: any) => signator.memberId);
      if (data.PromissoryNoteGroup?.status?.value === 'SIGNED') {
        this.allowToEdit = false;
      }
    });
  }

  openApproveDialog() {
    const warningtDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'Convertir a pagaré',
        dialogContext:
          'Al consolidar este grupo ya no podrás editar ni mover inversionistas. El grupo pasará a estado Aprobado y deberás revisar y generar el pagaré asociado. Deseas continuar',
        type: 'Mild',
        confirmButtonText: 'Consolidar y continuar'
      }
    });
    warningtDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.approvePromissoryNote();
      }
    });
  }

  getPromissoryNoteGroup() {
    this.organizationService.getPromissoryNoteGroup(this.PromissoryNoteGroup.id).subscribe((data: any) => {
      this.PromissoryNoteGroup = data;
      this.dataSource.data = this.PromissoryNoteGroup.investmentList;
      this.loading = false;
      this.selectedSignators = this.PromissoryNoteGroup.signatorList.map((signator: any) => signator.memberId);
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  getSignators() {
    this.clientService.getClientFamilyMembers(this.projectData.ownerId).subscribe((data: any) => {
      this.dataSourceLegal.data = data.filter((member: any) => member.relationshipId === 304);
      this.dataSourceAval.data = data.filter((member: any) => member.relationshipId === 306);
    });
  }

  get haveLegalSelected() {
    return this.selectedSignatorsArray.value.some((signatorId: any) =>
      this.dataSourceLegal.data.some((member) => member.id === signatorId)
    );
  }

  resetFilters() {
    this.filters.reset();
    this.dataSource.data = this.PromissoryNoteGroup.investmentList;
  }

  getGroupsList() {
    this.organizationService.getPromissoryNoteGroups(this.projectData.id).subscribe((data: any[]) => {
      const filteredData = data.filter((group) => group.id !== this.PromissoryNoteGroup.id);
      this.othersGroups = filteredData.map((group) => ({
        value: group.id,
        label: group.mnemonic
      }));
    });
  }

  assignInvestsments(groupId: string) {
    this.loading = true;
    const removePayload = {
      investmentList: this.selectedInvestments.map((invest) => {
        return { participationId: invest.id, toAdd: false };
      })
    };
    const assignPayload = {
      investmentList: this.selectedInvestments.map((invest) => {
        return { participationId: invest.id, toAdd: true };
      })
    };
    this.organizationService
      .assignInsvestmentsToGroup(this.PromissoryNoteGroup.id, JSON.stringify(removePayload))
      .subscribe((response) => {
        this.organizationService
          .assignInsvestmentsToGroup(groupId, JSON.stringify(assignPayload))
          .subscribe((response) => {
            this.selectedInvestments = [];
            this.getGroupsList();
            this.organizationService.getPromissoryNoteGroup(this.PromissoryNoteGroup.id).subscribe((data: any) => {
              this.PromissoryNoteGroup = data;
              this.dataSource.data = this.PromissoryNoteGroup.investmentList;
              this.loading = false;
            });
          });
      });
  }

  get selectedSignatorsArray(): FormArray {
    return this.clientForm.get('selectedSignators') as FormArray;
  }

  addGroupd() {
    const html = `<p style="margin: unset;">Las inversiones seleccionadas dan un monto total de  <strong> ${this.currencyPipe.transform(this.amountOfInvestorsSelected, this.currency)}</strong></p> <br/><p style="margin: unset;">proyecto: <strong>${this.projectData.name}</strong></p>`;
    const securedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        formfields: [
          {
            controlName: 'Selecciona un grupo existente',
            required: true,
            value: null,
            controlType: 'select',
            options: {
              data: this.othersGroups,
              value: 'value',
              label: 'label'
            },
            label: 'Selecciona un grupo existente'
          }
        ],
        layout: {
          columns: 1,
          addButtonText: 'Assign',
          descriptionHtml: securedHtml
        },
        title: 'Asignar inversiones a un grupo'
      }
    });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.assignInvestsments(response.data.value['Selecciona un grupo existente']);
      }
    });
  }

  formatDateForInput(date: any): string {
    const d = new Date(date);
    const corrected = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    console.log(corrected.toISOString().split('T')[0]);
    return corrected.toISOString().split('T')[0];
  }
  ngOnInit(): void {
    this.minDate = this.settingsService.minAllowedDate;
    this.maxDate = this.settingsService.businessDate;
    this.organizationService.getGroupStatus(this.PromissoryNoteGroup.id).subscribe((data: any) => {});
    this.getSignators();
    this.getGroupsList();
    this.filters = this.formBuilder.group({
      clientClassificationId: [
        ''
      ],
      name: [
        ''
      ]
    });
    this.filters.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      const filteredData = this.PromissoryNoteGroup.investmentList.filter((investment: any) => {
        return (
          (values.clientClassificationId
            ? (investment.clientClassification ? investment.clientClassification.id : 296) ===
              values.clientClassificationId
            : true) &&
          (values.name ? investment.participantName.toLowerCase().includes(values.name.toLowerCase()) : true)
        );
      });
      this.dataSource.data = filteredData;
    });
    this.getDefaultCurrency();
    this.clientForm = this.formBuilder.group({
      documentNumber: [
        this.PromissoryNoteGroup.documentNumber,
        Validators.required
      ],
      date: [
        new Date(this.PromissoryNoteGroup.creationDate),
        Validators.required
      ],
      mnemonic: [
        { value: this.PromissoryNoteGroup.mnemonic, disabled: true },
        Validators.required
      ],
      selectedSignators: this.formBuilder.array([...this.selectedSignators], Validators.required)
    });
  }

  get amountOfInvestorsSelected() {
    let total = 0;
    this.selectedInvestments.forEach((invest) => {
      total = total + invest.amount;
    });
    return total;
  }

  backToGroups() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  onInvestorSelected(event: { checked: boolean }, invest: any) {
    if (event.checked) {
      this.selectedInvestments.push(invest);
    } else {
      const index = this.selectedInvestments.indexOf(invest);
      if (index > -1) {
        this.selectedInvestments.splice(index, 1);
      }
    }
  }
  onSignatorSelected(event: { checked: boolean }, signatorId: any) {
    const formArray = this.selectedSignatorsArray;
    if (event.checked) {
      this.loading = true;
      this.organizationService
        .assignSignatorToGroup(this.PromissoryNoteGroup.id, signatorId)
        .pipe(
          finalize(() => {
            this.getPromissoryNoteGroup();
          })
        )
        .subscribe((response) => {
          if (!formArray.value.includes(signatorId)) {
            formArray.push(this.formBuilder.control(signatorId));
          }
        });
    } else {
      this.loading = true;
      const signator = this.PromissoryNoteGroup.signatorList.filter(
        (signator: any) => signator.memberId === signatorId
      );
      this.organizationService
        .removeSignatorToGroup(signator[0].id)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe((response) => {
          const index = formArray.value.indexOf(signatorId);
          const index2 = this.selectedSignators.indexOf(signatorId);
          if (index > -1) {
            formArray.removeAt(index);
          }
          if (index2 > -1) {
            this.selectedSignators.splice(index2, 1);
          }
        });
    }
  }

  get promissoryNoteQuantity() {
    let total = 0;
    this.PromissoryNoteGroup.investmentList.forEach((invest: any) => {
      total = total + invest.amount;
    });
    return total;
  }

  getDateFormatted(date: any): string {
    const localDate = new Date(date);

    const formatter = new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const parts = formatter.formatToParts(localDate);
    const dayStr = parts.find((p) => p.type === 'day')?.value;
    const monthStr = parts.find((p) => p.type === 'month')?.value;
    const yearStr = parts.find((p) => p.type === 'year')?.value;

    return `${dayStr} ${monthStr} ${yearStr}`;
  }

  saveGroup() {
    this.loading = true;
    const documetNumber = this.clientForm.get('documentNumber')?.value;
    const data = {
      documentNumber: documetNumber === this.PromissoryNoteGroup.documentNumber ? undefined : documetNumber,
      signators: this.selectedSignatorsArray.value,
      creationDate: this.getDateFormatted(this.clientForm.get('date')?.value),
      dateFormat: 'dd MMMM yyyy',
      locale: 'es'
    };
    this.organizationService
      .editInsvestmentGroup(this.PromissoryNoteGroup.id, JSON.stringify(data))
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response) => {
        this.router.navigate(['../..'], { relativeTo: this.route });
        this.loading = false;
      });
  }
  approvePromissoryNote() {
    this.loading = true;
    const documetNumber = this.clientForm.get('documentNumber')?.value;
    const data = {
      documentNumber: documetNumber === this.PromissoryNoteGroup.documentNumber ? undefined : documetNumber,
      signators: this.selectedSignatorsArray.value,
      creationDate: this.getDateFormatted(this.clientForm.get('date')?.value),
      dateFormat: 'dd MMMM yyyy',
      locale: 'es',
      signedDate: this.datePipe.transform(new Date(), 'dd MMMM yyyy', '', 'es')
    };
    this.organizationService
      .editInsvestmentGroup(this.PromissoryNoteGroup.id, JSON.stringify(data))
      .subscribe((response) => {
        this.organizationService
          .aprobeGroup(this.PromissoryNoteGroup.id)
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe((response) => {
            this.router.navigate(['../..'], { relativeTo: this.route });
            this.loading = false;
          });
      });
  }

  generateFundPromissoryPdf() {
    const payload = { groupId: this.PromissoryNoteGroup.id };
    this.organizationService.generateFundPromissoryPdf(payload).subscribe((data: any) => {
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'PagareFondo.pdf';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    });
  }
}
