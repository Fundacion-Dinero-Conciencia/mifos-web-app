/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * DocumentTypes resolver.
 */
@Injectable()
export class DocumentTypesResolver implements Resolve<Object> {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}
  /**
   * Returns the DocumentTypes data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getDocumentTypeCodes();
  }
}
