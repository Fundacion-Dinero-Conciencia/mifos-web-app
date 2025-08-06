/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Identifier resolver.
 */
@Injectable()
export class ClientIdentifierResolver implements Resolve<Object> {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}
  /**
   * Returns the Client Identities data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getCodeByName('Customer Identifier');
  }
}
