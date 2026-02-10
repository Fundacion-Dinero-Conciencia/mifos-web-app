import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SystemService } from 'app/system/system.service';
import { SettingsService } from 'app/settings/settings.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'mifosx-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  displayedColumns: string[] = [
    'period',
    'daysInPeriod',
    'dueDate',
    'obligationsMetOnDate',
    'principalLoanBalanceOutstanding',
    'principalDue',
    'interestDue',
    'feeChargesDue',
    'penaltyChargesDue',
    'totalOutstandingForPeriod',
    'totalPaidForPeriod',
    'totalPaidInAdvanceForPeriod',
    'totalPaidLateForPeriod',
    'totalOverdue',
    'status',
    'actions'
  ];
  calendarViewData: any;
  currency: string = '';
  subCreditinfo: any;
  globalData: any;
  dataSource = new MatTableDataSource<any>([]);
  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService
  ) {
    this.getDefaultCurrency();
    this.route.data.subscribe(({ data }: any) => {
      this.calendarViewData = data.schedulePeriods;
      this.globalData = data;
    });
  }
  ngOnInit(): void {
    const subCreditinfo = history?.state?.subCreditInfo;
    if (subCreditinfo) {
      this.subCreditinfo = subCreditinfo;
    }
    this.dataSource.data = this.calendarViewData;
  }
  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  getFirstPeriodWithoutPayment(): any {
    for (let i = 0; i < this.calendarViewData.length; i++) {
      const period = this.calendarViewData[i];
      if (period.totalPaidForPeriod === 0) {
        return period;
      }
    }
    return null;
  }

  canShowDetails(row: any): boolean {
    return true;
  }
}
