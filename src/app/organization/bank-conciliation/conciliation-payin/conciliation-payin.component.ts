import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

export interface ConciliationRow {
  systemDate: string | Date;
  rut: string;
  clientType: string;
  clientName: string;
  transactionId: string;
  totalAmount: number;
  assignmentsCount: number;
  status: 'CONCILIADO' | 'PENDIENTE' | 'NO_ENCONTRADO' | string;
}

@Component({
  selector: 'mifosx-conciliation-payin',
  templateUrl: './conciliation-payin.component.html',
  styleUrls: ['./conciliation-payin.component.scss']
})
export class ConciliationPayinComponent implements OnInit, AfterViewInit {
  filters: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder) {}
  currency = 'CLP'; // o lo que uses en tu sistema
  dataSource = new MatTableDataSource<ConciliationRow>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = [
    'systemDate',
    'rut',
    'clientType',
    'clientName',
    'transactionId',
    'totalAmount',
    'assignmentsCount',
    'status',
    'actions'
  ];
  ngOnInit(): void {
    this.filters = this.fb.group({
      clientType: ['ALL'],
      rut: [''],
      transactionId: [''],
      status: ['ALL']
    });
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onSearch(): void {
    const value = this.filters.value;
    console.log('Buscar con filtros:', value);
  }

  onClear(): void {
    this.filters.reset({
      clientType: 'ALL',
      rut: '',
      transactionId: '',
      status: 'ALL'
    });
  }
  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONCILIADO':
        return 'Conciliado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'NO_ENCONTRADO':
        return 'No encontrado';
      default:
        return status || '-';
    }
  }

  canAssign(row: ConciliationRow): boolean {
    // aquí pones tu lógica real
    return row.status === 'PENDIENTE';
  }

  onView(row: ConciliationRow): void {
    // lógica tuya
    console.log('Ver', row);
  }

  onAssign(row: ConciliationRow): void {
    // lógica tuya
    console.log('Asignar', row);
  }

  onRowClick(row: ConciliationRow): void {
    // si quieres que al hacer click en la fila pase algo
    console.log('Row click', row);
  }
}
