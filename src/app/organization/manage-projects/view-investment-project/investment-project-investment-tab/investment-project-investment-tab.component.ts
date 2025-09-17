import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'app/core/alert/alert.service';
import { OrganizationService } from 'app/organization/organization.service';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'mifosx-investment-project-investment-tab',
  templateUrl: './investment-project-investment-tab.component.html',
  styleUrls: ['./investment-project-investment-tab.component.scss']
})
export class InvestmentProjectInvestmentTabComponent implements OnInit {
  projectData: any;
  investments: any;
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private alertService: AlertService
  ) {
    this.route.data.subscribe((data: { accountData: any; investments: any }) => {
      this.projectData = data.accountData;
    });
    this.filters = this.formBuilder.group({
      accountType: [
        ''
      ],
      name: [
        ''
      ]
    });
  }
  filters: UntypedFormGroup;
  displayedColumns: string[] = [
    'Investor',
    'Value invested',
    'Investment status',
    'Watch promissory note',
    'Watch order'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  requestParams = {};
  ngOnInit(): void {
    this.loadInvestments(0, 10);
  }

  downloadPromissoryNote(id: string) {
    this.organizationService
      .downloadPromissoryNote(id)
      .pipe(
        catchError((error) => {
          this.alertService.alert({
            type: 'error',
            message: 'No tiene pagarè adjunto'
          });
          throw error;
        })
      )
      .subscribe((response: any) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }

  downloadMandate(clientId: string, amount: string, projectId: string) {
    const jsonData = {
      clientId: clientId,
      amount: amount,
      projectId: projectId
    };
    this.organizationService.getRetailMandate(JSON.stringify(jsonData)).subscribe((response: any) => {
      const byteCharacters = atob(response);
      const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }
  downloadFundMandate(clientId: string, amount: string) {
    const jsonData = {
      clientId: clientId,
      amount: amount
    };
    this.organizationService.getFundMandate(JSON.stringify(jsonData)).subscribe((response: any) => {
      const byteCharacters = atob(response);
      const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  loadInvestments(page: number, size: number) {
    this.requestParams = {
      projectId: this.projectData?.id,
      statusCode: 100,
      page,
      size
    };

    this.organizationService.getProjectParticipationPageable(this.requestParams).subscribe((response: any) => {
      this.dataSource.data = response.content || response;
      this.paginator.length = response.total;
      this.dataSource.paginator = this.paginator;
    });
  }

  codeToState(code: number): string {
    switch (code) {
      case 100:
        return 'Aceptada';
      case 200:
        return 'Pendiente';
      case 300:
        return 'Rechazada';
      case 400:
        return 'Reservado';

      default:
        'Pendiente';
        break;
    }
  }

  onPageChange(event: any) {
    this.loadInvestments(event.pageIndex, event.pageSize);
  }

  shorten(content: string, length: number = 100): string {
    const plain = content?.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ') || '';
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }
}
