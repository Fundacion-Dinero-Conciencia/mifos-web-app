import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

/**
 * User Sync Service
 * Handles integration with third-party user synchronization systems.
 */
@Injectable({
  providedIn: 'root'
})
export class UserSyncService {
  /**
   * @param {HttpClient} http Http Client
   */
  constructor(private http: HttpClient) {}

  /**
   * Updates user details in Keycloak only if relevant fields have changed.
   * @param {any} newData New client data from the form.
   * @param {any} originalData Original client data before editing.
   */
  updateKeycloakUser(newData: any, originalData: any) {
    if (!environment.pushClientDataChangesToKeycloak) {
      console.log('UserSyncService: pushClientDataChangesToKeycloak flag is disabled. Skipping synchronization.');
      return of(null);
    }

    const username = newData.emailAddress || originalData.emailAddress;
    if (!username) {
      console.warn('UserSyncService: No email address found, skipping sync.');
      return of(null);
    }

    const payload: any = {};

    const newFirstName = newData.firstname || newData.fullname || '';
    const oldFirstName = originalData.firstname || originalData.fullname || '';
    if (newFirstName !== oldFirstName) {
      payload.firstName = newFirstName;
    }

    const newLastName = newData.lastname || '';
    const oldLastName = originalData.lastname || '';
    if (newLastName !== oldLastName) {
      payload.lastName = newLastName;
    }

    if (newData.externalId !== originalData.externalId) {
      payload.external_id = newData.externalId || '';
    }

    if (newData.mobileNo !== originalData.mobileNo) {
      payload.phone = newData.mobileNo || '';
    }

    if (newData.emailAddress !== originalData.emailAddress) {
      payload.email = newData.emailAddress || '';
    }

    if (Object.keys(payload).length === 0) {
      console.log('UserSyncService: No changes detected in relevant fields. Skipping synchronization.');
      return of(null);
    }

    const url = `${environment.userSyncUrl}/user/${username}`;
    console.log(`UserSyncService: updateKeycloakUser initiated for ${username}`);
    console.log('UserSyncService: payload:', payload);
    console.log('UserSyncService: POST to:', url);

    return this.http.disableApiPrefix().post(url, payload);
  }
}
