import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { showGlobalLoader, hideGlobalLoader } from 'app/shared/helpers/loaders';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-payment-simulation',
  templateUrl: './payment-simulation.component.html',
  styleUrls: ['./payment-simulation.component.scss']
})
export class PaymentSimulationComponent implements OnInit {
  dataSource: any;
  dataSourceDetail: any;
  dueDateDatePickerValue: string = '';
  isModalOpen: boolean = false;
  isSimulated: boolean = false;
  isDetailingSimultation: boolean = false;
  elementSelected: number[] = [];
  clientData: any;
  haveError: boolean = false;
  currency: string;
  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = [
    'checkbox',
    'proyect',
    'Number',
    'dueDate',
    'creditProduct',
    'originalCredit',
    'haveToPay',
    'daysInArrears',
    'arrears'
  ];
  displayedColumnsDetail: string[] = [
    'proyect',
    'Number',
    'daysInArrears',
    'cuotesCuantity',
    'capital',
    'interest',
    'arrears',
    'total'
  ];
  minDate: any = '';
  maxDate: any = '';
  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private clientService: ClientsService,
    private dateUtils: Dates,
    private systemService: SystemService
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

  async getTableInformation() {
    try {
      showGlobalLoader();
      const response = await this.clientService.getClientsForPaymentSimulation(this.clientData.id).toPromise();

      this.dataSource = response;
    } catch (error) {
    } finally {
      hideGlobalLoader();
    }
  }

  ngOnInit(): void {
    this.getDefaultCurrency();
    this.setMaxDate();
    this.getTableInformation();
  }

  setMaxDate() {
    const today = new Date(this.minDate);
    this.maxDate = new Date(today.setDate(today.getDate() + 90));
  }
  get areAllSelected(): boolean {
    if (this.dataSource.length === 0) {
      return false;
    }

    return this.dataSource.every((x: any) => this.elementSelected.includes(x.loanId));
  }

  selectAll($event: any) {
    if ($event.checked) {
      this.elementSelected = this.dataSource.map((x: any) => x.loanId);
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

  async simulatePaymentProjection() {
    try {
      showGlobalLoader();

      const dateFormat = this.settingsService.dateFormat;
      const locale = this.settingsService.language.code;

      const params = {
        loanIds: this.elementSelected,
        cutoffDate: this.dateUtils.formatDate(this.dueDateDatePickerValue, dateFormat),
        dateFormat: dateFormat,
        locale: locale
      };

      const response = await this.clientService.createPaymentSimulation(this.clientData.id, params).toPromise();

      this.dataSourceDetail = response;
      this.isSimulated = true;
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

  seeSimulationDetails() {
    this.isDetailingSimultation = true;
  }

  goBack() {
    this.isDetailingSimultation = false;
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }
}
