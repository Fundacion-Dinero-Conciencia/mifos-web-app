/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Not Found Component
import { NotFoundComponent } from './not-found/not-found.component';
import { NotPermissionComponent } from './no-permission/not-permission.component';

/**
 * Fallback to this route when no prior route is matched.
 */
const routes: Routes = [
  {
    path: 'no-permission',
    component: NotPermissionComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

/**
 * App Routing Module.
 *
 * Configures the fallback route.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
