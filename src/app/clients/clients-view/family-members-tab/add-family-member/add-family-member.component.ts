/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Add Family Member Component
 */
@Component({
  selector: 'mifosx-add-family-member',
  templateUrl: './add-family-member.component.html',
  styleUrls: ['./add-family-member.component.scss']
})
export class AddFamilyMemberComponent implements OnInit {
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Minimum age allowed is 0. */
  minAge = 0;
  /** Add family member form. */
  addFamilyMemberForm: UntypedFormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  /** Client ID */
  clientId: any;
  /** Client Identifier Codes */
  clientIdentifierCodes: any;
  /** Relation Code Value */
  relationValue: any;

  /**
   * @param {FormBuilder} formBuilder FormBuilder
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {Route} route Route
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
    this.route.data.subscribe((data: { clientTemplate: any; clientIdentifierCodes: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
      this.clientIdentifierCodes = data.clientIdentifierCodes.codeValues;
    });
    this.clientId = this.route.parent.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createAddFamilyMemberForm();
  }

  /**
   * Creates the add family member form
   */
  createAddFamilyMemberForm() {
    this.addFamilyMemberForm = this.formBuilder.group({
      firstName: [
        '',
        Validators.required
      ],
      middleName: [''],
      lastName: [
        '',
        Validators.required
      ],
      /* qualification: [''], */
      email: [
        '',
        Validators.required
      ],
      mobileNumber: [
        '',
        Validators.required
      ],
      /* age: [
        '',
        Validators.required
      ], */
      isMaritalPartnership: [''],
      relationshipId: [
        '',
        Validators.required
      ],
      genderId: [
        '',
        Validators.required
      ],
      /* professionId: [''], */
      maritalStatusId: [''],
      documentTypeId: [
        '',
        Validators.required
      ],
      address: [
        '',
        Validators.required
      ],
      documentNumber: [
        '',
        Validators.required
      ],
      expirationDate: ['']
      /* dateOfBirth: [
        '',
        Validators.required
      ] */
    });
  }

  /**
   * Submits the form and adds the family member
   */
  submit() {
    const addFamilyMemberFormData = this.addFamilyMemberForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDateOfBirth: Date = this.addFamilyMemberForm.value.dateOfBirth;
    const prevExpirationDate: Date = this.addFamilyMemberForm.value.expirationDate;
    if (addFamilyMemberFormData.dateOfBirth instanceof Date) {
      addFamilyMemberFormData.dateOfBirth = this.dateUtils.formatDate(prevDateOfBirth, dateFormat);
    }
    if (addFamilyMemberFormData.expirationDate instanceof Date) {
      addFamilyMemberFormData.expirationDate = this.dateUtils.formatDate(prevExpirationDate, dateFormat);
    }
    const data = {
      ...addFamilyMemberFormData,
      dateFormat,
      locale
    };
    this.clientsService.addFamilyMember(this.clientId, data).subscribe((res) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  getRelationValue() {
    const relationshipId = this.addFamilyMemberForm.get('relationshipId')?.value;

    const matchedCode = this.addFamilyMemberTemplate.relationshipIdOptions.find(
      (code: any) => code.id === relationshipId
    );

    this.relationValue = matchedCode?.name;
  }
}
