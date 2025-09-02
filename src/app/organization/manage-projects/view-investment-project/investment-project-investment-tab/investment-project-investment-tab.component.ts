import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from 'app/clients/clients.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mifosx-investment-project-investment-tab',
  templateUrl: './investment-project-investment-tab.component.html',
  styleUrls: ['./investment-project-investment-tab.component.scss']
})
export class InvestmentProjectInvestmentTabComponent {
  projectData: any;
  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private clientService: ClientsService
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }

  displayedColumns: string[] = [
    'Investor',
    'Value invested',
    'Investment status',
    'Watch promissory note',
    'Watch order'
  ];
  dataSource: MatTableDataSource<any>;

  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }
}
