/** Angular Imports */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { CertificatesComponent } from './certificates/certificates.component';
import { ReportsComponent } from './reports.component';
import { RunReportComponent } from './run-report/run-report.component';
import { XBRLReportComponent } from './xbrl-report/xbrl-report.component';
import { XBRLComponent } from './xbrl/xbrl.component';
/** Custom Resolvers */
import { GlobalConfigurationsResolver } from 'app/system/configurations/global-configurations-tab/global-configurations.resolver';
import { GlAccountsResolver } from '../accounting/common-resolvers/gl-accounts.resolver';
import { MixMappingsResolver } from './common-resolvers/mixmappings.resolver';
import { MixTaxonomyResolver } from './common-resolvers/mixtaxonomy.resolver';
import { ReportsResolver } from './common-resolvers/reports.resolver';
import { RunReportResolver } from './common-resolvers/run-report.resolver';
import { InterestCertificateComponent } from './interest-certificate/interest-certificate.component';

/** Reports Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'certificates',
      data: { title: 'Certificates', breadcrumb: 'Certificates' },
      children: [
        {
          path: '',
          component: CertificatesComponent
        },
        {
          path: 'interest',
          data: { title: 'interest certificate', breadcrumb: 'interest' },
          component: InterestCertificateComponent
        }
      ]
    },
    {
      path: 'reports',
      data: { title: 'Reports', breadcrumb: 'Reports' },
      resolve: {
        reports: ReportsResolver
      },
      children: [
        {
          path: '',
          component: ReportsComponent
        },
        {
          path: ':filter',
          data: { routeParamBreadcrumb: 'filter' },
          component: ReportsComponent
        },
        {
          path: 'run/:name',
          data: { title: 'Reports', routeParamBreadcrumb: 'name' },
          component: RunReportComponent,
          resolve: {
            reportParameters: RunReportResolver,
            configurations: GlobalConfigurationsResolver
          }
        }
      ]
    },
    {
      path: 'xbrl',
      data: { title: 'XBRL', breadcrumb: 'XBRL' },
      children: [
        {
          path: '',
          component: XBRLComponent,
          resolve: {
            mixtaxonomy: MixTaxonomyResolver,
            mixmapping: MixMappingsResolver,
            glAccounts: GlAccountsResolver
          }
        },
        {
          path: 'report',
          data: { title: 'XBRL Report', breadcrumb: 'Run Report' },
          component: XBRLReportComponent
        }
      ]
    }
  ])

];

/**
 * Reports Routing Module
 *
 * Configures the reports routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ReportsResolver,
    RunReportResolver,
    MixTaxonomyResolver,
    MixMappingsResolver,
    GlAccountsResolver
  ]
})
export class ReportsRoutingModule {}
