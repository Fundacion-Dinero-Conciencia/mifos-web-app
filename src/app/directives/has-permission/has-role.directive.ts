import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

@Directive({
  selector: '[mifosxHasRole]'
})
export class HasRoleDirective {
  private userRoles: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authenticationService: AuthenticationService
  ) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.userRoles = savedCredentials.roles || [];
  }

  @Input()
  set mifosxHasRole(role: string | string[]) {
    this.viewContainer.clear();

    if (this.hasRole(role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private hasRole(role: string | string[]): boolean {
    if (!role) return false;

    // Permite pasar un solo rol o varios
    if (Array.isArray(role)) {
      return role.some((r) => this.userRoles.includes(r));
    }

    return this.userRoles.includes(role);
  }
}
