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
    private settingsService: SettingsService,
    private alertService: AlertService,
    private translateService: AlertService
  ) {
    this.route.data.subscribe((data: any) => {
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

  ngOnInit(): void {
    this.setMaxDate();
  }

  setMaxDate() {
    const today = new Date(this.minDate);
    this.maxDate = new Date(today.setDate(today.getDate() + 90));
  }

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

  isSelected(id: number): boolean {
    return this.elementSelected.includes(id);
  }

  simulatePaymentProjection() {
    //TODO metodo de simulacion de proyeccion de pago
    console.log(this.dueDateDatePickerValue);
    console.log(this.elementSelected);
    this.isDetailingSimultation = true;
    try {
      showGlobalLoader();
    } catch (error) {
    } finally {
      hideGlobalLoader();
    }
  }
  downloadPDF() {
    //TODO metodo de descargar PDF
    try {
      showGlobalLoader();
    } catch (error) {
      this.haveError = true;
    } finally {
      this.isModalOpen = true;
      hideGlobalLoader();
    }
  }
}
