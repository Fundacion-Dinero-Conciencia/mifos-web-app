/** Angular Imports */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { ClientTemplateResolver } from 'app/clients/common-resolvers/client-template.resolver';
import { AdhocQueryComponent } from './adhoc-query/adhoc-query.component';
import { CreateAdhocQueryComponent } from './adhoc-query/create-adhoc-query/create-adhoc-query.component';
import { EditAdhocQueryComponent } from './adhoc-query/edit-adhoc-query/edit-adhoc-query.component';
import { ViewAdhocQueryComponent } from './adhoc-query/view-adhoc-query/view-adhoc-query.component';
import { BulkImportComponent } from './bulk-import/bulk-import.component';
import { ViewBulkImportComponent } from './bulk-import/view-bulk-import/view-bulk-import.component';
import { BulkLoanReassignmnetComponent } from './bulk-loan-reassignmnet/bulk-loan-reassignmnet.component';
import { CurrenciesComponent } from './currencies/currencies.component';
import { ManageCurrenciesComponent } from './currencies/manage-currencies/manage-currencies.component';
import { CreateEmployeeComponent } from './employees/create-employee/create-employee.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { EmployeesComponent } from './employees/employees.component';
import { ViewEmployeeComponent } from './employees/view-employee/view-employee.component';
import { CreateEnityDataTableChecksComponent } from './entity-data-table-checks/create-enity-data-table-checks/create-enity-data-table-checks.component';
import { EntityDataTableChecksComponent } from './entity-data-table-checks/entity-data-table-checks.component';
import { FundMappingComponent } from './fund-mapping/fund-mapping.component';
import { CreateHolidayComponent } from './holidays/create-holiday/create-holiday.component';
import { EditHolidayComponent } from './holidays/edit-holiday/edit-holiday.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { ViewHolidaysComponent } from './holidays/view-holidays/view-holidays.component';
import { CreateLoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/create-loan-provisioning-criteria/create-loan-provisioning-criteria.component';
import { EditLoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/edit-loan-provisioning-criteria/edit-loan-provisioning-criteria.component';
import { LoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/loan-provisioning-criteria.component';
import { ViewLoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/view-loan-provisioning-criteria/view-loan-provisioning-criteria.component';
import { ManageFundsComponent } from './manage-funds/manage-funds.component';
import { PromissoryNoteGroupsResolver } from './manage-projects/investment-project-promissory-notes.resolver';
import { CreateOfficeComponent } from './offices/create-office/create-office.component';
import { EditOfficeComponent } from './offices/edit-office/edit-office.component';
import { OfficesComponent } from './offices/offices.component';
import { DatatableTabsComponent } from './offices/view-office/datatable-tabs/datatable-tabs.component';
import { GeneralTabComponent } from './offices/view-office/general-tab/general-tab.component';
import { ViewOfficeComponent } from './offices/view-office/view-office.component';
import { OrganizationComponent } from './organization.component';
import { PasswordPreferencesComponent } from './password-preferences/password-preferences.component';
import { CreatePaymentTypeComponent } from './payment-types/create-payment-type/create-payment-type.component';
import { EditPaymentTypeComponent } from './payment-types/edit-payment-type/edit-payment-type.component';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { CreateCampaignComponent } from './sms-campaigns/create-campaign/create-campaign.component';
import { EditCampaignComponent } from './sms-campaigns/edit-campaign/edit-campaign.component';
import { SmsCampaignsComponent } from './sms-campaigns/sms-campaigns.component';
import { ViewCampaignComponent } from './sms-campaigns/view-campaign/view-campaign.component';
import { StandingInstructionsHistoryComponent } from './standing-instructions-history/standing-instructions-history.component';
import { AllocateCashComponent } from './tellers/cashiers/allocate-cash/allocate-cash.component';
import { CashiersComponent } from './tellers/cashiers/cashiers.component';
import { CreateCashierComponent } from './tellers/cashiers/create-cashier/create-cashier.component';
import { EditCashierComponent } from './tellers/cashiers/edit-cashier/edit-cashier.component';
import { SettleCashComponent } from './tellers/cashiers/settle-cash/settle-cash.component';
import { TransactionsComponent } from './tellers/cashiers/transactions/transactions.component';
import { ViewCashierComponent } from './tellers/cashiers/view-cashier/view-cashier.component';
import { CreateTellerComponent } from './tellers/create-teller/create-teller.component';
import { EditTellerComponent } from './tellers/edit-teller/edit-teller.component';
import { TellersComponent } from './tellers/tellers.component';
import { ViewTellerComponent } from './tellers/view-teller/view-teller.component';
import { WorkingDaysComponent } from './working-days/working-days.component';

/** Custom Resolvers */
import { LoanProductsResolver } from 'app/products/loan-products/loan-products.resolver';
import { CustomerDocumentsResolver } from 'app/shared/tabs/entity-documents-tab/customer-documents.resolver';
import { DocumentTypesResolver } from 'app/shared/tabs/entity-documents-tab/document-types.resolver';
import { AdhocQueryTemplateResolver } from './adhoc-query/adhoc-query-template.resolver';
import { AdhocQueriesResolver } from './adhoc-query/common-resolvers/adhoc-queries.resolver';
import { AdhocQueryAndTemplateResolver } from './adhoc-query/common-resolvers/adhoc-query-and-template.resolver';
import { AdhocQueryResolver } from './adhoc-query/common-resolvers/adhoc-query.resolver';
import { BulkImportResolver } from './bulk-import/bulk-import.resolver';
import { CurrenciesResolver } from './currencies/currencies.resolver';
import { EditEmployeeResolver } from './employees/edit-employee.resolver';
import { EmployeeResolver } from './employees/employee.resolver';
import { EmployeesResolver } from './employees/employees.resolver';
import { EntityDataTableChecksTemplateResolver } from './entity-data-table-checks/enitity-data-table-checks-template.resolver';
import { EntityDataTableChecksResolver } from './entity-data-table-checks/entity-data-table-checks.resolver';
import { AdvanceSearchTemplateResolver } from './fund-mapping/advance-search-template.resolver';
import { HolidayTemplateResolver } from './holidays/holiday-template.resolver';
import { HolidayResolver } from './holidays/holiday.resolver';
import { InvestorsComponent } from './investors/investors.component';
import { LoanProvisioningCriteriaAndTemplateResolver } from './loan-provisioning-criteria/common-resolvers/loan-provisioning-criteria-and-template.resolver';
import { LoanProvisioningCriteriaTemplateResolver } from './loan-provisioning-criteria/common-resolvers/loan-provisioning-criteria-template.resolver';
import { LoanProvisioningCriteriaResolver } from './loan-provisioning-criteria/common-resolvers/loan-provisioning-criteria.resolver';
import { LoanProvisioningCriteriasResolver } from './loan-provisioning-criteria/common-resolvers/loan-provisioning-criterias.resolver';
import { CreateFundComponent } from './manage-funds/create-fund/create-fund.component';
import { EditFundComponent } from './manage-funds/edit-fund/edit-fund.component';
import { ManageFundResolver } from './manage-funds/manage-fund.resolver';
import { ManageFundsResolver } from './manage-funds/manage-funds.resolver';
import { ViewFundComponent } from './manage-funds/view-fund/view-fund.component';
import { CreateProjectParticipationComponent } from './manage-project-participation/create-project-participation/create-project-participation.component';
import { ManageProjectParticipationComponent } from './manage-project-participation/manage-project-participation.component';
import { ManageProjectParticipationsResolver } from './manage-project-participation/manage-project-participations.resolver';
import { CreateInvestmentProjectComponent } from './manage-projects/create-investment-project/create-investment-project.component';
import { DataCodeAreaResolver } from './manage-projects/data-code-area.resolver';
import { DataCodeCategoryResolver } from './manage-projects/data-code-category.resolver';
import { DataCodeCountryResolver } from './manage-projects/data-code-country.resolver';
import { DataCodeCreditTypesResolver } from './manage-projects/data-code-credit-types.resolver';
import { DataCodeLoanPurposeResolver } from './manage-projects/data-code-loan-purpose.resolver';
import { DataCodeObjectiveResolver } from './manage-projects/data-code-objective.resolver';
import { DataCodeStatusResolver } from './manage-projects/data-code-status.resolver';
import { DataCodeSubCategoryResolver } from './manage-projects/data-code-subcategory.resolver';
import { EditInvestmentProjectComponent } from './manage-projects/edit-investment-project/edit-investment-project.component';
import { InvestmentProjectDocumentsResolver } from './manage-projects/investment-project-documents.resolver';
import { ProjectNotesResolver } from './manage-projects/investment-project-notes.resolver';
import { PromissoryNoteGroupResolver } from './manage-projects/investment-project-promissory-note-by-id.resolver';
import { InvestmentProjectTemplateResolver } from './manage-projects/investment-project-template.resolver';
import { ManageProjectResolver } from './manage-projects/manage-project.resolver';
import { ManageProjectsComponent } from './manage-projects/manage-projects.component';
import { ManageProjectsResolver } from './manage-projects/manage-projects.resolver';
import { StatusHistoryProjectResolver } from './manage-projects/status-history-project.resolver';
import { InvestmentProjectCommissionTabComponent } from './manage-projects/view-investment-project/investment-project-commission-tab/investment-project-commission-tab.component';
import { InvestmentProjectTabComponent } from './manage-projects/view-investment-project/investment-project-documents-tab/investment-project-documents-tab.component';
import { InvestmentProjectGeneralTabComponent } from './manage-projects/view-investment-project/investment-project-general-tab/investment-project-general-tab.component';
import { InvestmentProjectImageTabComponent } from './manage-projects/view-investment-project/investment-project-image-tab/investment-project-image-tab.component';
import { InvestmentProjectImpactTabComponent } from './manage-projects/view-investment-project/investment-project-impact-tab/investment-project-impact-tab.component';
import { InvestmentProjectInvestmentTabComponent } from './manage-projects/view-investment-project/investment-project-investment-tab/investment-project-investment-tab.component';
import { InvestmentProjectNotesTabComponent } from './manage-projects/view-investment-project/investment-project-notes-tab/investment-project-notes-tab.component';
import { EditPromissoryNoteComponent } from './manage-projects/view-investment-project/investment-project-promissory-note-tab/edit-promissory-note/edit-promissory-note.component';
import { InvestmentProjectPromissoryNoteTabComponent } from './manage-projects/view-investment-project/investment-project-promissory-note-tab/investment-project-promissory-note-tab.component';
import { InvestmentProjectSimulateTabComponent } from './manage-projects/view-investment-project/investment-project-simulate-tab/investment-project-simulate-tab.component';
import { ViewInvestmentProjectComponent } from './manage-projects/view-investment-project/view-investment-project.component';
import { ViewStatusHistoryComponent } from './manage-projects/view-status-history/view-status-history.component';
import { EditOfficeResolver } from './offices/common-resolvers/edit-office.resolver';
import { OfficeDatatableResolver } from './offices/common-resolvers/office-datatable.resolver';
import { OfficeDatatablesResolver } from './offices/common-resolvers/office-datatables.resolver';
import { OfficeResolver } from './offices/common-resolvers/office.resolver';
import { OfficesResolver } from './offices/common-resolvers/offices.resolver';
import { PasswordPreferencesTemplateResolver } from './password-preferences/password-preferences-template.resolver';
import { PaymentTypesResolver } from './payment-types/payment-types.resolver';
import { SmsCampaignTemplateResolver } from './sms-campaigns/common-resolvers/sms-campaign-template.resolver';
import { SmsCampaignResolver } from './sms-campaigns/common-resolvers/sms-campaign.resolver';
import { SmsCampaignsResolver } from './sms-campaigns/common-resolvers/sms-campaigns.resolver';
import { StandingInstructionsTemplateResolver } from './standing-instructions-history/standing-instructions-template.resolver';
import { CashierResolver } from './tellers/common-resolvers/cashier.resolver';
import { CashiersResolver } from './tellers/common-resolvers/cashiers.resolver';
import { EditCashierResolver } from './tellers/common-resolvers/edit-cashier.resolver';
import { CashierTransactionTemplateResolver } from './tellers/common-resolvers/teller-transaction-template.resolver';
import { TellerResolver } from './tellers/common-resolvers/teller.resolver';
import { TellersResolver } from './tellers/common-resolvers/tellers.resolver';
import { WorkingDaysResolver } from './working-days/working-days.resolver';
/** Organization Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'organization',
      data: { title: 'Organization', breadcrumb: 'Organization' },
      children: [
        {
          path: '',
          component: OrganizationComponent
        },
        {
          path: 'provisioning-criteria',
          data: { title: 'Provisioning Criteria', breadcrumb: 'Provisioning Criteria' },
          children: [
            {
              path: '',
              component: LoanProvisioningCriteriaComponent,
              resolve: {
                loanProvisioningCriterias: LoanProvisioningCriteriasResolver
              }
            },
            {
              path: 'create',
              data: { title: 'Create Provisioning Criteria', breadcrumb: 'Create Provisioning Criteria' },
              component: CreateLoanProvisioningCriteriaComponent,
              resolve: {
                loanProvisioningCriteriaTemplate: LoanProvisioningCriteriaTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: 'View Provisioning Criteria', routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewLoanProvisioningCriteriaComponent,
                  resolve: {
                    loanProvisioningCriteria: LoanProvisioningCriteriaResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditLoanProvisioningCriteriaComponent,
                  data: { title: 'Edit Provisioning Criteria', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    loanProvisioningCriteriaAndTemplate: LoanProvisioningCriteriaAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'offices',
          data: { title: 'Manage Offices', breadcrumb: 'Manage Offices' },
          children: [
            {
              path: '',
              component: OfficesComponent,
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: 'create',
              component: CreateOfficeComponent,
              data: { title: 'Create Office', breadcrumb: 'Create Office' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: ':officeId',
              data: { title: 'View Office', breadcrumb: 'officeId', routeParamBreadcrumb: 'officeId' },
              component: ViewOfficeComponent,
              resolve: {
                officeDatatables: OfficeDatatablesResolver
              },
              children: [
                {
                  path: '',
                  redirectTo: 'general',
                  pathMatch: 'full'
                },
                {
                  path: 'general',
                  component: GeneralTabComponent,
                  data: { title: 'General', breadcrumb: 'General', routeParamBreadcrumb: false },
                  resolve: {
                    office: OfficeResolver
                  }
                },
                {
                  path: 'datatables',
                  children: [
                    {
                      path: ':datatableName',
                      component: DatatableTabsComponent,
                      data: { title: 'Data Table View', routeParamBreadcrumb: 'datatableName' },
                      resolve: {
                        officeDatatable: OfficeDatatableResolver
                      }
                    }
                  ]
                }
              ]
            },
            {
              path: ':officeId/edit',
              component: EditOfficeComponent,
              data: { title: 'Edit Office', breadcrumb: 'Edit', routeParamBreadcrumb: false },
              resolve: {
                officeTemplate: EditOfficeResolver
              }
            }
          ]
        },
        {
          path: 'employees',
          data: { title: 'Manage Employees', breadcrumb: 'Manage Employees' },
          children: [
            {
              path: '',
              component: EmployeesComponent,
              resolve: {
                employees: EmployeesResolver
              }
            },
            {
              path: 'create',
              component: CreateEmployeeComponent,
              data: { title: 'Create Employee', breadcrumb: 'Create Employee' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: ':id',
              data: { title: 'View Employee', routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewEmployeeComponent,
                  resolve: {
                    employee: EmployeeResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditEmployeeComponent,
                  data: { title: 'Edit Employee', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    employee: EditEmployeeResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'currencies',
          data: { title: 'Currency Configuration', breadcrumb: 'Currency Configuration' },
          resolve: {
            currencies: CurrenciesResolver
          },
          children: [
            {
              path: '',
              component: CurrenciesComponent
            },
            {
              path: 'manage',
              data: { title: 'Manage Currencies', breadcrumb: 'Manage Currencies' },
              component: ManageCurrenciesComponent
            }
          ]
        },
        {
          path: 'sms-campaigns',
          data: { title: 'SMS Campaigns', breadcrumb: 'SMS Campaigns' },
          children: [
            {
              path: '',
              component: SmsCampaignsComponent,
              resolve: {
                smsCampaigns: SmsCampaignsResolver
              }
            },
            {
              path: 'create',
              data: { title: 'Create SMS Campaign', breadcrumb: 'Create Campaign' },
              component: CreateCampaignComponent,
              resolve: {
                smsCampaignTemplate: SmsCampaignTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: 'View SMS Campaign', routeResolveBreadcrumb: [
                  'smsCampaign',
                  'campaignName'
                ] },
              resolve: {
                smsCampaign: SmsCampaignResolver
              },
              runGuardsAndResolvers: 'always',
              children: [
                {
                  path: '',
                  component: ViewCampaignComponent
                },
                {
                  path: 'edit',
                  component: EditCampaignComponent,
                  data: { title: 'Edit SMS Campaign', breadcrumb: 'Edit', routeResolveBreadcrumb: false },
                  resolve: {
                    smsCampaignTemplate: SmsCampaignTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'standing-instructions-history',
          component: StandingInstructionsHistoryComponent,
          data: { title: 'Standing Instructions History', breadcrumb: 'Standing Instructions History' },
          resolve: {
            standingInstructionsTemplate: StandingInstructionsTemplateResolver
          }
        },
        {
          path: 'fund-mapping',
          component: FundMappingComponent,
          data: { title: 'Advance Search', breadcrumb: 'Advance Search' },
          resolve: {
            advanceSearchTemplate: AdvanceSearchTemplateResolver
          }
        },
        {
          path: 'investors',
          component: InvestorsComponent,
          data: { title: 'Investors', breadcrumb: 'Investors' },
          resolve: {}
        },
        {
          path: 'adhoc-query',
          data: { title: 'Adhoc Query', breadcrumb: 'Adhoc Query' },
          children: [
            {
              path: '',
              component: AdhocQueryComponent,
              resolve: {
                adhocQueries: AdhocQueriesResolver
              }
            },
            {
              path: 'create',
              component: CreateAdhocQueryComponent,
              data: { title: 'Create Adhoc Query', breadcrumb: 'Create' },
              resolve: {
                adhocQueryTemplate: AdhocQueryTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: 'View Adhoc Query', routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewAdhocQueryComponent,
                  resolve: {
                    adhocQuery: AdhocQueryResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditAdhocQueryComponent,
                  data: { title: 'Edit Adhoc Query', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    adhocQueryAndTemplate: AdhocQueryAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'tellers',
          data: { title: 'Tellers', breadcrumb: 'Tellers' },
          children: [
            {
              path: '',
              component: TellersComponent,
              resolve: {
                tellers: TellersResolver
              }
            },
            {
              path: 'create',
              component: CreateTellerComponent,
              data: { title: 'Create Teller', breadcrumb: 'Create' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: ':id',
              data: { title: 'View Teller', routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewTellerComponent,
                  resolve: {
                    teller: TellerResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditTellerComponent,
                  data: { title: 'Edit Teller', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    teller: TellerResolver,
                    offices: OfficesResolver
                  }
                },
                {
                  path: 'cashiers',
                  data: { title: 'Cashiers', breadcrumb: 'Cashiers', routeParamBreadcrumb: false },
                  children: [
                    {
                      path: '',
                      component: CashiersComponent,
                      resolve: {
                        cashiersData: CashiersResolver
                      }
                    },
                    {
                      path: 'create',
                      data: { title: 'Cashiers', breadcrumb: 'Create Cashier' },
                      component: CreateCashierComponent,
                      resolve: {
                        cashierTemplate: EditCashierResolver
                      }
                    },
                    {
                      path: ':id',
                      data: { title: 'View Cashier', routeParamBreadcrumb: 'id' },
                      children: [
                        {
                          path: '',
                          component: ViewCashierComponent,
                          data: { title: 'View Cashier', breadcrumb: 'View Cashier', routeParamBreadcrumb: false },
                          resolve: {
                            cashier: CashierResolver
                          }
                        },
                        {
                          path: 'edit',
                          component: EditCashierComponent,
                          data: { title: 'Edit Cashier', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                          resolve: {
                            cashier: CashierResolver,
                            cashierTemplate: EditCashierResolver
                          }
                        },
                        {
                          path: 'transactions',
                          data: {
                            title: 'Cashier Transactions',
                            breadcrumb: 'Transactions',
                            routeParamBreadcrumb: false
                          },
                          component: TransactionsComponent,
                          resolve: {
                            currencies: CurrenciesResolver
                          }
                        },
                        {
                          path: 'settle',
                          component: SettleCashComponent,
                          data: { title: 'Settle Cash', breadcrumb: 'Settle Cash', routeParamBreadcrumb: false },
                          resolve: {
                            cashierTemplate: CashierTransactionTemplateResolver
                          }
                        },
                        {
                          path: 'allocate',
                          component: AllocateCashComponent,
                          data: { title: 'Allocate Cash', breadcrumb: 'Allocate Cash', routeParamBreadcrumb: false },
                          resolve: {
                            cashierTemplate: CashierTransactionTemplateResolver
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          path: 'payment-types',
          data: { title: 'Payment Types', breadcrumb: 'Payment Types' },
          children: [
            {
              path: '',
              component: PaymentTypesComponent,
              resolve: {
                paymentTypes: PaymentTypesResolver
              }
            },
            {
              path: 'create',
              component: CreatePaymentTypeComponent,
              data: { title: 'Create Payment Type', breadcrumb: 'Create Payment Type' }
            },
            {
              path: ':id',
              data: { routeParamBreadcrumb: 'id', addBreadcrumbLink: false },
              children: [
                {
                  path: 'edit',
                  component: EditPaymentTypeComponent,
                  data: { title: 'Edit Payment Type', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    paymentType: PaymentTypesResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'password-preferences',
          component: PasswordPreferencesComponent,
          data: { title: 'Password Preferences', breadcrumb: 'Password Preferences' },
          resolve: {
            passwordPreferencesTemplate: PasswordPreferencesTemplateResolver
          }
        },
        {
          path: 'bulkloan',
          component: BulkLoanReassignmnetComponent,
          data: { title: 'Bulk Loan Reassignment', breadcrumb: 'Bulk Loan Reasssignment' },
          resolve: {
            offices: OfficesResolver
          }
        },
        {
          path: 'entity-data-table-checks',
          data: { title: 'Entity Data Table Checks', breadcrumb: 'Entity Data Table Checks' },
          children: [
            {
              path: '',
              component: EntityDataTableChecksComponent,
              resolve: {
                entityDataTableChecks: EntityDataTableChecksResolver
              }
            },
            {
              path: 'create',
              component: CreateEnityDataTableChecksComponent,
              data: { title: 'Create Entity Data Table Checks', breadcrumb: 'Create' },
              resolve: {
                dataTableEntity: EntityDataTableChecksTemplateResolver
              }
            }
          ]
        },
        {
          path: 'working-days',
          component: WorkingDaysComponent,
          data: { title: 'Working Days', breadcrumb: 'Working Days' },
          resolve: {
            workingDays: WorkingDaysResolver
          }
        },
        {
          path: 'manage-funds',
          data: { title: 'Manage Funds', breadcrumb: 'Manage Funds' },
          children: [
            {
              path: '',
              component: ManageFundsComponent,
              resolve: {
                funds: ManageFundsResolver
              }
            },
            {
              path: 'create',
              component: CreateFundComponent,
              data: { title: 'Create Fund', breadcrumb: 'Create' }
            },
            {
              path: ':id',
              data: { title: 'View Fund', breadcrumb: 'id', routeParamBreadcrumb: 'id' },
              resolve: {
                fundData: ManageFundResolver
              },
              children: [
                {
                  path: '',
                  component: ViewFundComponent,
                  resolve: {
                    fundData: ManageFundResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditFundComponent,
                  data: { title: 'Edit Fund', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    fundData: ManageFundResolver
                  }
                }
              ]
            }
          ],
          resolve: {
            funds: ManageFundsResolver
          }
        },
        {
          path: 'bulk-import',
          data: { title: 'Bulk Import', breadcrumb: 'Bulk Import' },
          children: [
            {
              path: '',
              component: BulkImportComponent
            },
            {
              path: ':import-name',
              component: ViewBulkImportComponent,
              data: { title: 'View Bulk Import', routeParamBreadcrumb: 'import-name' },
              resolve: {
                offices: OfficesResolver,
                imports: BulkImportResolver
              }
            }
          ]
        },
        {
          path: 'holidays',
          data: { title: 'Manage Holidays', breadcrumb: 'Manage Holidays' },
          children: [
            {
              path: '',
              component: HolidaysComponent,
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: 'create',
              component: CreateHolidayComponent,
              data: { title: 'Create Holiday', breadcrumb: 'Create' },
              resolve: {
                offices: OfficesResolver,
                holidayTemplate: HolidayTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: 'View Holidays', routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewHolidaysComponent,
                  resolve: {
                    holidays: HolidayResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditHolidayComponent,
                  data: { title: 'Edit Holidays', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    holiday: HolidayResolver,
                    holidayTemplate: HolidayTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'projects',
          data: { title: 'Manage Projects', breadcrumb: 'Manage Projects' },
          children: [
            {
              path: '',
              component: ManageProjectsComponent,
              resolve: {
                projects: ManageProjectsResolver
              }
            },
            {
              path: 'create',
              component: CreateInvestmentProjectComponent,
              data: { title: 'Create Investment Project', breadcrumb: 'Create Investment Project' },
              resolve: {
                countryData: DataCodeCountryResolver,
                categoryData: DataCodeCategoryResolver,
                subcategoryData: DataCodeSubCategoryResolver,
                areaData: DataCodeAreaResolver,
                objectivesData: DataCodeObjectiveResolver,
                statusData: DataCodeStatusResolver,
                loanProductsData: LoanProductsResolver,
                creditTypesData: DataCodeCreditTypesResolver,
                loanPurposeData: DataCodeLoanPurposeResolver
              }
            },
            {
              path: 'statusHistory/:id',
              component: ViewStatusHistoryComponent
              // data: {routeParamBreadcrumb: 'id'},
              // resolve: {
              //   statusHistoryData: StatusHistoryProjectResolver
              // }
            },
            {
              path: ':id',
              component: ViewInvestmentProjectComponent,
              data: { title: 'View Investment Project', routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  redirectTo: 'general',
                  pathMatch: 'full'
                },
                {
                  path: 'general',
                  component: InvestmentProjectGeneralTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'View', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver
                  }
                },
                {
                  path: 'documents',
                  component: InvestmentProjectTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'Documents', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver,
                    InvestmentDocuments: InvestmentProjectDocumentsResolver,
                    customerDocumentOptions: CustomerDocumentsResolver,
                    documentTypeOptions: DocumentTypesResolver
                  }
                },
                {
                  path: 'simulaciones',
                  component: InvestmentProjectSimulateTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'Simulations', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver,
                    loanPurposeData: DataCodeLoanPurposeResolver,
                    loanProductsData: LoanProductsResolver
                  }
                },
                {
                  path: 'impacto',
                  component: InvestmentProjectImpactTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'Impact', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver
                  }
                },
                {
                  path: 'notas',
                  component: InvestmentProjectNotesTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'Notes', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver,
                    notes: ProjectNotesResolver
                  }
                },
                {
                  path: 'inversiones',
                  component: InvestmentProjectInvestmentTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'investments', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver,
                    clientTemplate: ClientTemplateResolver
                  }
                },
                {
                  path: 'grupos-pagare',
                  component: InvestmentProjectPromissoryNoteTabComponent,
                  data: { title: 'Investment Project', breadcrumb: 'pagaré', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver,
                    clientTemplate: ClientTemplateResolver,
                    PromissoryNoteGroups: PromissoryNoteGroupsResolver
                  }
                },
                {
                  path: 'grupos-pagare/edit/:noteId',
                  component: EditPromissoryNoteComponent,
                  data: { title: 'Investment Project', breadcrumb: 'editar pagaré', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver,
                    clientTemplate: ClientTemplateResolver,
                    PromissoryNoteGroup: PromissoryNoteGroupResolver
                  }
                },
                {
                  path: 'publicacion',
                  component: InvestmentProjectImageTabComponent,
                  data: { title: 'publication', breadcrumb: 'Publication', routeParamBreadcrumb: false },
                  resolve: {
                    imageData: InvestmentProjectDocumentsResolver,
                    accountData: ManageProjectResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditInvestmentProjectComponent,
                  data: { title: 'Edit Investment Project', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    //accountData: InvestmentProjectTemplateResolver,
                    countryData: DataCodeCountryResolver,
                    categoryData: DataCodeCategoryResolver,
                    subcategoryData: DataCodeSubCategoryResolver,
                    areaData: DataCodeAreaResolver,
                    objectivesData: DataCodeObjectiveResolver,
                    statusData: DataCodeStatusResolver,
                    creditTypesData: DataCodeCreditTypesResolver,
                    loanPurposeData: DataCodeLoanPurposeResolver,
                    imageData: InvestmentProjectDocumentsResolver,
                    accountData: ManageProjectResolver
                  }
                },
                {
                  path: 'commissions',
                  component: InvestmentProjectCommissionTabComponent,
                  data: { title: 'Investment Project Commissions', breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    accountData: ManageProjectResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'project-participation',
          data: { title: 'Manage Project Participation', breadcrumb: 'Manage Project Participation' },
          children: [
            {
              path: '',
              component: ManageProjectParticipationComponent,
              resolve: {
                projectparticipations: ManageProjectParticipationsResolver
              }
            },
            {
              path: 'create',
              component: CreateProjectParticipationComponent,
              data: { title: 'Create Project Participation', breadcrumb: 'Create Project Participation' },
              resolve: {
                //accountData: InvestmentProjectTemplateResolver
              }
            },
            {
              path: ':projectId',
              component: ManageProjectParticipationComponent,
              resolve: {
                projectparticipations: ManageProjectParticipationsResolver
              }
            }
          ]
        }
      ]
    }
  ])

];

/**
 * Organization Routing Module
 *
 * Configures the organization routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    LoanProvisioningCriteriaResolver,
    OfficesResolver,
    EmployeesResolver,
    EmployeeResolver,
    EditEmployeeResolver,
    CurrenciesResolver,
    SmsCampaignsResolver,
    SmsCampaignResolver,
    SmsCampaignTemplateResolver,
    AdhocQueriesResolver,
    AdhocQueryResolver,
    TellersResolver,
    TellerResolver,
    PaymentTypesResolver,
    PasswordPreferencesTemplateResolver,
    EntityDataTableChecksResolver,
    WorkingDaysResolver,
    EditOfficeResolver,
    AdhocQueryTemplateResolver,
    AdhocQueryAndTemplateResolver,
    LoanProvisioningCriteriasResolver,
    CashierResolver,
    CashiersResolver,
    HolidayResolver,
    OfficeResolver,
    OfficeDatatableResolver,
    OfficeDatatablesResolver,
    ManageFundsResolver,
    CashierTransactionTemplateResolver,
    EditCashierResolver,
    HolidayResolver,
    HolidayTemplateResolver,
    BulkImportResolver,
    HolidayResolver,
    EntityDataTableChecksTemplateResolver,
    LoanProvisioningCriteriasResolver,
    LoanProvisioningCriteriaTemplateResolver,
    LoanProvisioningCriteriaAndTemplateResolver,
    StandingInstructionsTemplateResolver,
    AdvanceSearchTemplateResolver,
    ManageProjectsResolver,
    ManageProjectResolver,
    InvestmentProjectTemplateResolver,
    ManageProjectParticipationsResolver,
    DataCodeCountryResolver,
    DataCodeCategoryResolver,
    DataCodeSubCategoryResolver,
    DataCodeAreaResolver,
    DataCodeStatusResolver,
    StatusHistoryProjectResolver,
    InvestmentProjectDocumentsResolver,
    ProjectNotesResolver,
    DataCodeObjectiveResolver,
    DataCodeCreditTypesResolver,
    DataCodeLoanPurposeResolver
  ]
})
export class OrganizationRoutingModule {}
