/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Manage Funds data resolver.
 */
@Injectable()
export class ManageProjectParticipationsResolver implements Resolve<Object> {
  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the manage funds data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const projectId = route.params.projectId;
    if (projectId) {
      return this.organizationService.getInvestmentProjectParticipationsByProjectId(projectId);
    } else {
      return this.organizationService.getInvestmentProjectParticipations();
    }
  }
}
