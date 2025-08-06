/** Angular Imports. */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { environment } from 'environments/environment';
import { ClientsService } from './clients.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  @ViewChild('showClosedAccounts') showClosedAccounts: MatCheckbox;

  clientTypeOptions: [];

  displayedColumns = [
    'displayName',
    'mnemonic',
    'accountNumber',
    'externalId',
    'status',
    'officeName'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  existsClientsToFilter = false;
  notExistsClientsToFilter = false;

  totalRows: number;
  isLoading = false;

  pageSize = 50;
  currentPage = 0;
  filterText = '';
  clientTypeId: number;

  sortAttribute = '';
  sortDirection = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private clientService: ClientsService,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { clientTypeOptions: any }) => {
      this.clientTypeOptions = data.clientTypeOptions.codeValues;
    });
  }

  ngOnInit() {
    if (environment.preloadClients) {
      this.getClients();
    }
  }

  /**
   * Searches server for query and resource.
   */
  search(value: string) {
    this.filterText = value;
    this.resetPaginator();
    this.getClients();
  }

  private getClients() {
    this.isLoading = true;
    this.clientService
      .searchByText(
        this.filterText,
        this.clientTypeId,
        this.currentPage,
        this.pageSize,
        this.sortAttribute,
        this.sortDirection
      )
      .subscribe(
        (data: any) => {
          this.dataSource.data = data.content;

          this.totalRows = data.totalElements;

          this.existsClientsToFilter = data.numberOfElements > 0;
          this.notExistsClientsToFilter = !this.existsClientsToFilter;
          this.isLoading = false;
        },
        (error: any) => {
          this.isLoading = false;
        }
      );
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getClients();
  }

  sortChanged(event: Sort) {
    if (event.direction === '') {
      this.sortDirection = '';
      this.sortAttribute = '';
    } else {
      this.sortAttribute = event.active;
      this.sortDirection = event.direction;
    }
    this.resetPaginator();
    this.getClients();
  }

  private resetPaginator() {
    this.currentPage = 0;
    this.paginator.firstPage();
  }

  applyClientTypeChange(clientType: any) {
    this.clientTypeId = clientType.value;
    this.getClients();
  }
}
