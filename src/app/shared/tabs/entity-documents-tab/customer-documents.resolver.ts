/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Customer Documents resolver.
 */
@Injectable()
export class CustomerDocumentsResolver implements Resolve<Object> {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}
  /**
   * Returns the Customer Documents data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getCustomerDocumentCodes();
  }
}
