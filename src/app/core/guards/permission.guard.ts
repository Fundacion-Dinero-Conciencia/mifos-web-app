import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const action: any = route.data['permission'] || route.paramMap.get('action') || route.paramMap.get('name');
    console.log('GUARDA ACTIVA', action);
    const permissions = this.authService.getCredentials()?.permissions;

    const actionPermissionMap: any = {
      'Make Repayment': 'REPAYMENT_LOAN',
      'Deposit': 'DEPOSIT_SAVINGSACCOUNT',
      'Transfer Funds': 'CREATE_ACCOUNTTRANSFER',
      'Interbank Transfer': 'CREATE_ACCOUNTTRANSFER',
      'Prepay Loan': 'REPAYMENT_LOAN',
      'Charge-Off': 'CHARGEOFF_LOAN'
      // aqui se deben poner los que se quieren validar estrictos, abiertos para los actions de las cuentas al menos de savings y loans
    };

    const requiredPermission = actionPermissionMap[action];

    if (!requiredPermission || permissions?.includes(requiredPermission)) {
      return true;
    }

    this.router.navigate(['/no-permission']);
    return false;
  }
}
