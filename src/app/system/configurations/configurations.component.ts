import { Component, OnInit } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';
import { SystemService } from '../system.service';

@Component({
  selector: 'mifosx-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss']
})
export class ConfigurationsComponent implements OnInit {
  /** Subscription to alerts. */
  alert$: Subscription;

  isBusinessDateEnabled = false;
  isDefaultAccountEnabled = false;

  constructor(
    private alertService: AlertService,
    private systemService: SystemService
  ) {}

  ngOnInit(): void {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = alertEvent.message === 'enabled' ? true : false;
      } else if (alertType === SettingsService.defaultAccountType + ' Set Config') {
        this.isDefaultAccountEnabled = alertEvent.message === 'enabled' ? true : false;
      }
      this.getConfigurations();
      this.getConfigurationsDefaultAccount();
    });
  }

  /**
   * Get the Configuration and the Business Date data
   */
  getConfigurations(): void {
    this.systemService
      .getConfigurationByName(SettingsService.businessDateConfigName)
      .subscribe((configurationData: any) => {
        this.isBusinessDateEnabled = configurationData.enabled;
      });
  }

  /**
   * Get the Configuration default account
   */
  getConfigurationsDefaultAccount(): void {
    this.systemService
      .getConfigurationByName(SettingsService.defaultAccountConfigName)
      .subscribe((configurationData: any) => {
        this.isDefaultAccountEnabled = configurationData.enabled;
      });
  }
}
