/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
/**
 * Edit Family Member Component
 */
@Component({
  selector: 'mifosx-edit-family-member',
  templateUrl: './edit-family-member.component.html',
  styleUrls: ['./edit-family-member.component.scss']
})
export class EditFamilyMemberComponent implements OnInit, AfterViewInit {
  @ViewChild('addressPicker') addressPicker!: ElementRef;
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add family member form. */
  editFamilyMemberForm: UntypedFormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  /** Family Members Details */
  familyMemberDetails: any;
  /** Client Identifier Codes */
  clientIdentifierCodes: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {ActivatedRoute} route Route
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    private router: Router,
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { clientTemplate: any; editFamilyMember: any; clientIdentifierCodes: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
      this.familyMemberDetails = data.editFamilyMember;
      this.clientIdentifierCodes = data.clientIdentifierCodes.codeValues;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const value = this.editFamilyMemberForm.controls['address'].value;
      if (value && this.addressPicker?.nativeElement) {
        const component = this.addressPicker.nativeElement;
        const shadow = component.shadowRoot;
        const inputEl = shadow?.querySelector('input');
        inputEl.value = value;
      }
    }, 50);
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditFamilyMemberForm(this.familyMemberDetails);
  }

  /**
   * Creates Edit Family Member Form
   * @param {any} familyMember Family Member
   */
  createEditFamilyMemberForm(familyMember: any) {
    this.editFamilyMemberForm = this.formBuilder.group({
      firstName: [
        familyMember.firstName,
        Validators.required
      ],
      middleName: [familyMember.middleName],
      lastName: [
        familyMember.lastName,
        Validators.required
      ],
      /* qualification: [familyMember.qualification], */
      email: [familyMember.email],
      mobileNumber: [familyMember.mobileNumber],
      /* age: [
        familyMember.age,
        Validators.required
      ], */
      isMaritalPartnership: [familyMember.isMaritalPartnership],
      relationshipId: [
        familyMember.relationshipId,
        Validators.required
      ],
      genderId: [
        familyMember.genderId,
        Validators.required
      ],
      /* professionId: [familyMember.professionId], */
      maritalStatusId: [familyMember.maritalStatusId],
      documentTypeId: [
        familyMember.documentTypeId,
        Validators.required
      ],
      documentNumber: [
        familyMember.documentNumber,
        Validators.required
      ],
      address: [
        familyMember.address,
        Validators.required
      ]
      /* dateOfBirth: [
        this.dateUtils.formatDate(familyMember.dateOfBirth, 'yyyy-MM-dd'),
        Validators.required
      ] */
    });
  }

  /**
   * Submits the form and updates the client family member.
   */
  submit() {
    const editFamilyMemberFormData = this.editFamilyMemberForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDateOfBirth: Date = this.editFamilyMemberForm.value.dateOfBirth;
    if (editFamilyMemberFormData.dateOfBirth instanceof Date) {
      editFamilyMemberFormData.dateOfBirth = this.dateUtils.formatDate(prevDateOfBirth, dateFormat);
    }
    const data = {
      ...editFamilyMemberFormData,
      dateFormat,
      locale
    };
    this.clientsService
      .editFamilyMember(this.familyMemberDetails.clientId, this.familyMemberDetails.id, data)
      .subscribe((res) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
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

    const control = this.editFamilyMemberForm.get(controlName);
    control?.setValue(address);
    control?.markAsDirty();
    control?.markAsTouched();
  }

  getRelationValue() {
    const relationshipId = this.editFamilyMemberForm.get('relationshipId')?.value;

    const matchedCode = this.clientIdentifierCodes.find((code: any) => code.id === relationshipId);

    return matchedCode.name;
  }
}
