/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Loans notes resolver.
 */
@Injectable()
export class ProjectNotesResolver implements Resolve<Object> {
  /**
   * @param {SystemService} systemService
   */
  constructor(private systemService: SystemService) {}

  /**
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const projectId = route.parent.paramMap.get('id');
    return this.systemService.getObjectNotes('investmentprojects', projectId);
  }
}
