import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserSyncService } from './user-sync.service';
import { environment } from '../../../environments/environment';

describe('UserSyncService', () => {
  let service: UserSyncService;
  let httpMock: HttpTestingController;

  const mockOriginalData = {
    firstname: 'John',
    lastname: 'Doe',
    externalId: 'ext-123',
    mobileNo: '1234567890',
    emailAddress: 'john.doe@example.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserSyncService]
    });
    service = TestBed.inject(UserSyncService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock disableApiPrefix on the HttpClient instance
    const httpClient = TestBed.inject(HttpClient);
    (httpClient as any).disableApiPrefix = () => httpClient;

    // Default flag to true for most tests
    environment.pushClientDataChangesToKeycloak = true;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send all fields in payload when all fields have changed', () => {
    const newData = {
      firstname: 'Jane',
      lastname: 'Smith',
      externalId: 'ext-456',
      mobileNo: '0987654321',
      emailAddress: 'jane.smith@example.com'
    };

    service.updateKeycloakUser(newData, mockOriginalData).subscribe();

    const req = httpMock.expectOne(`${environment.userSyncUrl}/user/${newData.emailAddress}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      firstName: 'Jane',
      lastName: 'Smith',
      external_id: 'ext-456',
      phone: '0987654321',
      email: 'jane.smith@example.com'
    });
    req.flush({});
  });

  it('should only send changed fields in payload when only one field changes', () => {
    const newData = {
      ...mockOriginalData,
      mobileNo: '5555555555'
    };

    service.updateKeycloakUser(newData, mockOriginalData).subscribe();

    const req = httpMock.expectOne(`${environment.userSyncUrl}/user/${newData.emailAddress}`);
    expect(req.request.body).toEqual({
      phone: '5555555555'
    });
    req.flush({});
  });

  it('should handle special characters in email address correctly', () => {
    const emailWithSpecialChars = "john+test.o'neil@example.com";
    const newData = {
      ...mockOriginalData,
      emailAddress: emailWithSpecialChars
    };

    service.updateKeycloakUser(newData, mockOriginalData).subscribe();

    // The URL should be constructed correctly.
    // HttpClient handles encoding of the URL path segments if they are passed as parameters,
    // but here we are using template strings.
    const req = httpMock.expectOne(`${environment.userSyncUrl}/user/${emailWithSpecialChars}`);
    expect(req.request.body).toEqual({
      email: emailWithSpecialChars
    });
    req.flush({});
  });

  it('should skip the call and return of(null) when the feature flag is disabled', () => {
    (environment as any).pushClientDataChangesToKeycloak = false;
    const newData = { ...mockOriginalData, firstname: 'Jane' };

    service.updateKeycloakUser(newData, mockOriginalData).subscribe((result: any) => {
      expect(result).toBeNull();
    });

    httpMock.expectNone(`${environment.userSyncUrl}/user/${newData.emailAddress}`);
  });

  it('should skip the call when the feature flag is unset (undefined)', () => {
    (environment as any).pushClientDataChangesToKeycloak = undefined;
    const newData = { ...mockOriginalData, firstname: 'Jane' };

    service.updateKeycloakUser(newData, mockOriginalData).subscribe((result: any) => {
      expect(result).toBeNull();
    });

    httpMock.expectNone(`${environment.userSyncUrl}/user/${newData.emailAddress}`);
  });

  it('should skip the call when no relevant fields have changed', () => {
    const newData = { ...mockOriginalData };

    service.updateKeycloakUser(newData, mockOriginalData).subscribe((result: any) => {
      expect(result).toBeNull();
    });

    httpMock.expectNone(`${environment.userSyncUrl}/user/${newData.emailAddress}`);
  });
});
