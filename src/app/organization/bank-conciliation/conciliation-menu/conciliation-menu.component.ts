import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';

interface ConciliationProduct {
  name: string;
  icon: string;
  description: string;
  code: 'PAYIN' | 'PAYOUT' | 'REINVESTMENT';
}

@Component({
  selector: 'mifosx-conciliation-menu',
  templateUrl: './conciliation-menu.component.html',
  styleUrls: ['./conciliation-menu.component.scss']
})
export class ConciliationMenuComponent implements OnInit {
  icons = [
    '💰',
    '💸',
    '♻️'
  ];
  displayedColumnsMethods: string[] = [
    'name',
    'description',
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild('menuTable', { static: true }) instructionTableRef: MatTable<Element>;

  ngOnInit() {
    this.dataSource.data = [
      {
        icon: 'assets/icons/money-bag.png',
        name: 'Payin',
        description:
          'Gestiona la conciliación automática y manual de pagos entrantes (Payin), vinculando los abonos bancarios a créditos, cuotas o pagarés.'
      },
      {
        icon: 'assets/icons/transfer.png',
        name: 'payout',
        description:
          'Administra la conciliación de pagos salientes (Payout), relacionando las transferencias bancarias con las órdenes de pago generadas en el sistema.'
      },
      {
        icon: 'assets/icons/recycle.png',
        name: 'Reinversión',
        description:
          'Gestiona la retención de transacciones disponibles para destinarlas a una nueva inversión sin generar salida de dinero.'
      }
    ];
  }

  viewMethod(method: any) {
    console.log('Ver método:', method);
  }

  onRowClick(row: any) {
    console.log('Row clicked:', row);
  }
}
