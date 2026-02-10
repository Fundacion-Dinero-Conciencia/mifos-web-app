import { AfterViewInit, Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { OrganizationService } from 'app/organization/organization.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
export interface ConciliationRow {
  company: string;
  rut: string;
  subCredit: string;
  promissoryNoteNo: number; // N° de pagaré
  status: 'Activo' | 'Cerrado';
}

@Component({
  selector: 'mifosx-subcredits',
  templateUrl: './subcredits.component.html',
  styleUrls: ['./subcredits.component.scss']
})
export class SubcreditsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'company',
    'rut',
    'subCredit',
    'promissoryNoteNo',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<ConciliationRow>([]);
  constructor(private organizationService: OrganizationService) {}
  pageIndex = 0;
  pageSize = 5;
  totalItems = 0;
  filter = '';
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((value) => {
      this.onFilter(value);
    });
  }

  applyFilters(): void {
    this.paginator.firstPage();
    this.loadPage(0, this.pageSize, this.filter);
  }

  loadPage(page: number, size: number, filter?: string) {
    console.log(size);
    const requestParams = {
      page,
      size,
      search: filter || ''
    };
    console.log(this.filter);
    if (filter.length === 0) {
      this.dataSource.data = [];
      return;
    }
    this.organizationService.getPayoutItems({ ...requestParams }).subscribe((response: any) => {
      this.dataSource.data = response.content || response;
      this.pageSize = size;
      this.pageIndex = page;
      this.totalItems = response.totalElements;
    });
  }
  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize, this.filter);
  }
  capitalize(word: string) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  onFilter(value: string): void {
    this.loadPage(0, this.pageSize, value);
  }
  onSearchInput(value: string): void {
    this.filter = value;
    this.search$.next(value);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
