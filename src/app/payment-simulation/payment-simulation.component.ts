import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { showGlobalLoader, hideGlobalLoader } from 'app/shared/helpers/loaders';

@Component({
  selector: 'mifosx-payment-simulation',
  templateUrl: './payment-simulation.component.html',
  styleUrls: ['./payment-simulation.component.scss']
})
export class PaymentSimulationComponent implements OnInit {
  dataSource = new MatTableDataSource([]);
  dataSourceDetail = new MatTableDataSource([]);
  dueDateDatePickerValue: string = '';
  isModalOpen: boolean = false;
  isDetailingSimultation: boolean = false;
  elementSelected: number[] = [];
  clientData: any;
  haveError: boolean = false;
  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = [
    'checkbox',
    'proyect',
    'Number',
    'sueDate',
    'creditProduct',
    'originalCredit',
    'haveToPay',
    'daysInArrears'
  ];
  displayedColumnsDetail: string[] = [
    'proyect',
    'Number',
    'sueDays',
    'cuotesCuantity',
    'capital',
    'haveToPay',
    'daysInArrearsAmount',
    'total'
  ];
  minDate: any = '';
  maxDate: any = '';
  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: any) => {
      //Aqui esta la info del cliente, se asigna a clientData para mostrar en la vista y para lo que se necesite
      this.clientData = data.clientViewData;
    });
    this.minDate = this.settingsService.businessDate;
  }

  closeModal() {
    this.isModalOpen = false;
    this.haveError = false;
  }
  openModal() {
    this.isModalOpen = true;
  }

  getTableInformation() {
    try {
      showGlobalLoader();
      //TODO metodo GET de informacion de la tabla con toPromise() y asignar el resultado a dataSource
    } catch (error) {
    } finally {
      hideGlobalLoader();
    }
  }

  ngOnInit(): void {
    this.setMaxDate();
    this.getTableInformation();
  }

  setMaxDate() {
    const today = new Date(this.minDate);
    this.maxDate = new Date(today.setDate(today.getDate() + 90));
  }
  //Es importanten aclarar que todos los metodos referentes al elementSelect se hicieron bajo la asumcion que tendra un campo ID de no ser asi se debe cambiar todos los llamados al .id por el identificador unico correspondiente
  get areAllSelected(): boolean {
    if (this.dataSource.data.length === 0) {
      return false;
    }

    return this.dataSource.data.every((x: any) => this.elementSelected.includes(x.id));
  }

  selectAll($event: any) {
    if ($event.checked) {
      this.elementSelected = this.clientData.loanAccounts.map((x: any) => x.id);
    } else {
      this.elementSelected = [];
    }
  }

  selectCredit(id: number) {
    if (this.elementSelected.includes(id)) {
      this.elementSelected = this.elementSelected.filter((x: any) => x !== id);
    } else {
      this.elementSelected.push(id);
    }
  }

  isSelected(id: number): boolean {
    return this.elementSelected.includes(id);
  }

  simulatePaymentProjection() {
    try {
      showGlobalLoader();
      //TODO metodo GET de  simulacion de proyeccion de pago con toPromise() y asignar el resultado a dataSourceDetail
      this.isDetailingSimultation = true;
    } catch (error) {
    } finally {
      hideGlobalLoader();
    }
  }
  downloadPDF() {
    try {
      showGlobalLoader();
      //TODO metodo de descargar PDF con toPromise()
    } catch (error) {
      this.haveError = true;
    } finally {
      this.isModalOpen = true;
      hideGlobalLoader();
    }
  }
}
