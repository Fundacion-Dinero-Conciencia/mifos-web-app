/** Angular Imports */
import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Search Tool Component
 */
@Component({
  selector: 'mifosx-search-tool',
  templateUrl: './search-tool.component.html',
  styleUrls: ['./search-tool.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))]),
      transition(':leave', [
        animate(500, style({ opacity: 0 }))])

    ])

  ]
})
export class SearchToolComponent {
  /** Query Form Control */
  query = new UntypedFormControl('');
  /** Resource Form Control */
  resource = new UntypedFormControl('');

  /** Sets the initial visibility of search input as hidden. Visible if true. */
  /** Resource Options */
  resourceOptions: any[] = [
    {
      name: 'All',
      value: 'clients,clientIdentifiers,groups,savings,shares,loans,promissoryGroups'
    },
    {
      name: 'Clients',
      value: 'clients,clientIdentifiers'
    },
    {
      name: 'Promissory Groups',
      value: 'promissoryGroups'
    },
    {
      name: 'Groups',
      value: 'groups'
    },
    {
      name: 'Savings',
      value: 'savings'
    },
    {
      name: 'Shares',
      value: 'shares'
    },
    {
      name: 'Loans',
      value: 'loans'
    }
  ];

  /**
   * @param {Router} router Router
   */
  constructor(private router: Router) {
    this.resource.patchValue('clients,clientIdentifiers,groups,savings,shares,loans,promissoryGroups');
  }

  /**
   * Toggles the visibility of search input with fadeInOut animation.
   */

  /**
   * Searches server for query and resource.
   */
  search() {
    const queryParams: any = {
      query: this.query.value,
      resource: this.resource.value
    };
    this.router.navigate(['/search'], { queryParams: queryParams });
  }
}
