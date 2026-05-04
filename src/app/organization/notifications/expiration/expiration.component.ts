import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { createInfiniteScroll } from 'app/shared/helpers/Dom';
import { showGlobalLoader } from 'app/shared/helpers/loaders';
import { hideGlobalLoader } from 'app/shared/helpers/loaders';
import { Router } from '@angular/router';

@Component({
  selector: 'mifosx-expiration',
  templateUrl: './expiration.component.html',
  styleUrls: ['./expiration.component.scss']
})
export class ExpirationComponent implements OnInit, AfterViewInit {
  showDialog: boolean = false;
  DateClass = new Dates(null as any);
  firstFetch: boolean = true;
  minDate: any = '';
  page: number = 0;
  size: number = 20;
  totalClients: number = 0;
  selectedClients: any[] = [];
  displayedClients: any[] = [];
  messageMode: string = 'all';
  notificationDate: any = '';
  inputSearchValue: string = '';
  scope = 1;
  messageModes: any[] = [
    {
      name: 'Todos',
      value: 'all'
    },
    {
      name: 'Con mora',
      value: 'arrears'
    },
    {
      name: 'Sin mora',
      value: 'not-arrears'
    }
  ];
  scopeOptions: any[] = [
    {
      name: 'Todos',
      value: 1
    },
    {
      name: 'Manual',
      value: 0
    }
  ];
  observer: any = null;

  constructor(
    private clientService: ClientsService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  isClientSelected(client: any): boolean {
    return this.selectedClients.some((c) => c.clientId === client.clientId);
  }

  addOrRemoveClient(client: any) {
    if (this.isClientSelected(client)) {
      this.selectedClients = this.selectedClients.filter((c) => c.clientId !== client.clientId);
    } else {
      this.selectedClients.push(client);
    }
  }

  loadMoreClients() {
    this.page++;
    this.getClients(true);
  }

  initScroll() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const container = document.getElementById('clientsContainer');
    const sentinel = document.getElementById('scrollSentinel');

    if (container && sentinel) {
      this.observer = createInfiniteScroll(sentinel, () => this.loadMoreClients(), {
        root: container,
        rootMargin: '150px',
        threshold: 0
      });
    }
  }

  ngOnInit(): void {
    this.minDate = this.settingsService.businessDate;

    this.getClients();
  }
  ngAfterViewInit(): void {
    this.initScroll();
  }
  get canSendEmail() {
    return false;
  }

  clearClientsSelection() {
    this.selectedClients = [];
  }

  avoidRepeatingClients(newClients: any[]): any[] {
    const existingClientIds = this.displayedClients.map((c) => c.clientId);
    const uniqueNewClients = newClients.filter((c) => !existingClientIds.includes(c.clientId));
    return [
      ...this.displayedClients,
      ...uniqueNewClients
    ];
  }

  searchByFilter() {
    this.page = 0;
    this.getClients();
  }

  async getClients(isByScroll = false) {
    const response = await this.clientService
      .getClientsForNotifications(this.inputSearchValue, this.messageMode, this.page, this.size)
      .toPromise();
    if (this.firstFetch) {
      this.firstFetch = false;
      this.totalClients = (response as any).totalElements;
    }
    if (!isByScroll) {
      this.displayedClients = (response as any).content;
      return;
    }
    const clients = (response as any).content;
    const sanitizedClients = this.avoidRepeatingClients(clients);
    this.displayedClients = sanitizedClients;
  }

  scopeChange(event: any) {
    this.page = 0;
    setTimeout(() => {
      this.initScroll();
    }, 10);
  }

  get canNotificateClients(): boolean {
    if (!this.notificationDate) {
      return false;
    }
    if (this.scope === 0) {
      return this.selectedClients.length > 0;
    }
    return true;
  }
  async sendNotifications() {
    const date = this.DateClass.formatDate(this.notificationDate, 'yyyy-MM-dd') || '';
    let clientIds: number[] | undefined = [];
    if (this.scope === 0) {
      clientIds = this.selectedClients.map((c) => c.clientId);
    }
    showGlobalLoader();
    try {
      await this.clientService.sendNotificationToClients(this.messageMode, date, clientIds).toPromise();
      this.router.navigate(['../.']);
    } catch (error) {
    } finally {
      hideGlobalLoader();
    }
  }
}
