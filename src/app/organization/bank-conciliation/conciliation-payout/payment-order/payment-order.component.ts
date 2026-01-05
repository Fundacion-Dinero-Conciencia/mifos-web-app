import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

interface InvestorPaymentRow {
  id: string | number;
  selected: boolean;

  investorName: string;
  investorLink?: any[];

  rut: string;
  participation: string; // ej: '40%'

  installmentAmount: number; // Monto cuota a pagar (endpoint)
  amountToPay: number | string; // editable (endpoint o inicial)
  amountToReinvest: number | string; // editable (endpoint o inicial)
}

@Component({
  selector: 'mifosx-payment-order',
  templateUrl: './payment-order.component.html',
  styleUrls: ['./payment-order.component.scss']
})
export class PaymentOrderComponent implements OnInit {
  // Header info (idealmente viene del endpoint)
  promissoryNo = '12345';
  subCreditNo = 'TEST46TSTC01';
  installmentNo = 2;

  currency = 'CLP';

  // Bar superior (idealmente viene del endpoint)
  includedCount = 3;
  totalCount = 4;
  totalToDisperse = 18000000;
  showDialog = false;
  displayedColumns: string[] = [
    'select',
    'investor',
    'rut',
    'participation',
    'installmentAmount',
    'amountToPay',
    'amountToReinvest'
  ];

  dataSource = new MatTableDataSource<InvestorPaymentRow>([]);

  // Paginación
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    // TODO: reemplazar por tu endpoint
    const mock: InvestorPaymentRow[] = [
      {
        id: 1,
        selected: true,
        investorName: 'Carlos Acevedo',
        investorLink: [],
        rut: '15.789.999-4',
        participation: '40%',
        installmentAmount: 8100000,
        amountToPay: 8000000,
        amountToReinvest: 100000
      },
      {
        id: 2,
        selected: true,
        investorName: 'Sofía Blanco',
        investorLink: [],
        rut: '14.456.789-3',
        participation: '30%',
        installmentAmount: 6000000,
        amountToPay: 6000000,
        amountToReinvest: 0
      },
      {
        id: 3,
        selected: true,
        investorName: 'Ignacio Pavez',
        investorLink: [],
        rut: '18.190.432-1',
        participation: '20%',
        installmentAmount: 4000000,
        amountToPay: 4000000,
        amountToReinvest: 0
      },
      {
        id: 4,
        selected: false,
        investorName: 'Isabel Soto',
        investorLink: [],
        rut: '10.999.111-3',
        participation: '10%',
        installmentAmount: 2000000,
        amountToPay: 2000000,
        amountToReinvest: 0
      }
    ];

    this.dataSource.data = mock;
    this.totalItems = mock.length;

    // Si prefieres que counts/totales vengan del backend,
    // asigna includedCount/totalCount/totalToDisperse directo desde la respuesta.
  }

  // --- UI helpers (sin cálculos de negocio) ---

  generatePayment() {
    console.log('Generando orden de pago...');
  }

  get masterChecked(): boolean {
    const rows = this.dataSource.data;
    return rows.length > 0 && rows.every((r) => r.selected);
  }

  get masterIndeterminate(): boolean {
    const rows = this.dataSource.data;
    const some = rows.some((r) => r.selected);
    const all = rows.length > 0 && rows.every((r) => r.selected);
    return some && !all;
  }

  toggleAll(checked: boolean): void {
    this.dataSource.data = this.dataSource.data.map((r) => ({ ...r, selected: checked }));
  }

  toggleRow(row: InvestorPaymentRow, checked: boolean): void {
    row.selected = checked;
  }

  onRowEdited(row: InvestorPaymentRow): void {
    // Hook para marcar dirty / habilitar guardar, etc.
  }

  onFilter(value: string): void {
    this.dataSource.filter = (value || '').trim().toLowerCase();
  }

  onPageChange(evt: PageEvent): void {
    this.pageIndex = evt.pageIndex;
    this.pageSize = evt.pageSize;
  }

  onCancel(): void {
    // navegar o reset
  }

  onSaveChanges(): void {
    // enviar payload al backend
  }

  onGeneratePayroll(): void {
    this.showDialog = true;
  }
}
