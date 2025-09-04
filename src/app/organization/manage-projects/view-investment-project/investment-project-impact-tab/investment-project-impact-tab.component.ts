import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from 'app/clients/clients.service';
@Component({
  selector: 'mifosx-investment-project-impact-tab',
  templateUrl: './investment-project-impact-tab.component.html',
  styleUrls: ['./investment-project-impact-tab.component.scss']
})
export class InvestmentProjectImpactTabComponent {
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
  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }
}
