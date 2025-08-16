/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Manage client type resolver.
 */
@Injectable()
export class ClientTypeCodeResolver implements Resolve<Object> {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the client type data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getCodeByName('ClientType');
  }
}
