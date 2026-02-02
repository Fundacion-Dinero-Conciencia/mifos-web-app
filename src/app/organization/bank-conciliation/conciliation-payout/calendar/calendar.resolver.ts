/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationService } from 'app/organization/organization.service';

@Injectable()
export class LoanCalendarResolver implements Resolve<Object> {
  constructor(private organizationService: OrganizationService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.organizationService.getLoanCalendarByLoanId(id);
  }
}
