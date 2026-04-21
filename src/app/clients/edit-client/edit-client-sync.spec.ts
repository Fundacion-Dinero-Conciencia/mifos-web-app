import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditClientComponent } from './edit-client.component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from '../clients.service';
import { UserSyncService } from '../../third-party/user-sync/user-sync.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('EditClientComponent - UserSync Integration', () => {
  let component: EditClientComponent;
  let fixture: ComponentFixture<EditClientComponent>;
  let userSyncServiceSpy: jasmine.SpyObj<UserSyncService>;
  let clientsServiceSpy: jasmine.SpyObj<ClientsService>;

  const mockClientDataAndTemplate: any = {
    id: '1',
    officeId: '1',
    staffId: '1',
    firstname: 'John',
    lastname: 'Doe',
    emailAddress: 'john.doe@example.com',
    mobileNo: '1234567890',
    externalId: 'ext-123',
    active: true,
    isStaff: false,
    timeline: {
      submittedOnDate: '2023-01-01',
      activatedOnDate: '2023-01-01'
    },
    officeOptions: [],
    staffOptions: [],
    clientLegalFormOptions: [],
    clientTypeOptions: [],
    clientClassificationOptions: [],
    clientNonPersonMainBusinessLineOptions: [],
    clientNonPersonConstitutionOptions: [],
    genderOptions: []
  };

  beforeEach(async(() => {
    const userSyncSpy = jasmine.createSpyObj('UserSyncService', ['updateKeycloakUser']);
    const clientsSpy = jasmine.createSpyObj('ClientsService', ['updateClient']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const settingsSpy = jasmine.createSpyObj('SettingsService', ['setLanguage']);
    (settingsSpy as any).language = { code: 'en' };
    (settingsSpy as any).dateFormat = 'dd MMMM yyyy';
    (settingsSpy as any).businessDate = new Date();

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [EditClientComponent],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: { data: of({ clientDataAndTemplate: mockClientDataAndTemplate }), routeConfig: {} }
        },
        { provide: Router, useValue: routerSpy },
        { provide: ClientsService, useValue: clientsSpy },
        { provide: UserSyncService, useValue: userSyncSpy },
        { provide: Dates, useValue: { formatDate: (date: any) => '2023-01-01' } },
        { provide: SettingsService, useValue: settingsSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    userSyncServiceSpy = TestBed.inject(UserSyncService) as jasmine.SpyObj<UserSyncService>;
    clientsServiceSpy = TestBed.inject(ClientsService) as jasmine.SpyObj<ClientsService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClientComponent);
    component = fixture.componentInstance;
  });

  it('should call UserSyncService when updateClient succeeds', () => {
    // 1. Manually setup the minimum state needed for submit()
    // We bypass ngOnInit to avoid crashing on complex Mifos initialization logic
    const fb = new UntypedFormBuilder();
    component.editClientForm = fb.group({
      firstname: ['Jane'],
      lastname: ['Smith'],
      emailAddress: ['jane.smith@example.com'],
      externalId: ['ext-456'],
      mobileNo: ['0987654321'],
      address: fb.array([]) // Required for some internal logic
    });

    // Ensure the mock data is present
    (component as any).clientDataAndTemplate = mockClientDataAndTemplate;

    // 2. Setup spies
    clientsServiceSpy.updateClient.and.returnValue(of({ id: '1' }));
    userSyncServiceSpy.updateKeycloakUser.and.returnValue(of({}));

    // 3. Execute
    component.submit();

    // 4. Verify
    expect(clientsServiceSpy.updateClient).toHaveBeenCalled();
    expect(userSyncServiceSpy.updateKeycloakUser).toHaveBeenCalledWith(jasmine.any(Object), mockClientDataAndTemplate);
  });
});
