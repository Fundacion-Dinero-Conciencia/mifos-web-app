import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

/** Custom Services */
import { Logger } from '../../core/logger/logger.service';

/** Initialize Logger */
const log = new Logger('UserSyncService');

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

  /** Sanitize and return the Base URL from the environment */
  private get BASE_URL(): string {
    return environment.userSyncUrl || '';
  }

  /**
   * Construct the full update endpoint for a specific user.
   * @param {string} username The username to append to the path.
   */
  private UPDATE_KEYCLOAK_USER_ENDPOINT(username: string): string {
    return `${this.BASE_URL}/keycloak/update/user/${username}`;
  }

  /**
   * Updates user details in Keycloak only if relevant fields have changed.
   * @param {any} newData New client data from the form.
   * @param {any} originalData Original client data before editing.
   */
  updateKeycloakUser(newData: any, originalData: any) {
    const logPrefix = '[user-sync.service::updateKeycloakUser]';
    log.debug(`${logPrefix} init`);

    if (!environment.pushClientDataChangesToKeycloak) {
      log.debug(`${logPrefix} pushClientDataChangesToKeycloak flag is disabled. Skipping synchronization.`);
      return of(null);
    }

    const username = originalData.emailAddress;
    if (!username) {
      log.debug(`${logPrefix} No email address found, skipping sync.`);
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
      log.debug(`${logPrefix} No changes detected in relevant fields. Skipping synchronization.`);
      return of(null);
    }

    const url = this.UPDATE_KEYCLOAK_USER_ENDPOINT(username);
    log.debug(`${logPrefix} updateKeycloakUser initiated for ${username}`);
    log.debug(`${logPrefix} payload:`, payload);
    log.debug(`${logPrefix} POST to:`, url);

    return this.http.disableApiPrefix().post(url, payload);
  }
}
