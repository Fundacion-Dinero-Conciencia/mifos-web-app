import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ClientsService } from 'app/clients/clients.service';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'mifosx-interest-certificate',
  templateUrl: './interest-certificate.component.html',
  styleUrls: ['./interest-certificate.component.scss']
})
export class InterestCertificateComponent implements OnInit, AfterViewInit {
  reportForm: UntypedFormGroup;
  clientsData: any[] = [];
  years: number[] = [];
  constructor(
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private reportsService: ReportsService
  ) {}

  getListOFYearsSince2000() {
    const currentYear = new Date().getFullYear();
    for (let year = 2000; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.getListOFYearsSince2000();
    this.reportForm = this.formBuilder.group({
      clientId: [
        '',
        Validators.required
      ],
      year: [
        new Date().getFullYear(),
        Validators.required
      ]
    });
  }
  ngAfterViewInit() {
    this.reportForm.controls.clientId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
          this.clientsData = data.pageItems;
        });
      }
    });
  }
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  downloadReport() {
    this.reportsService
      .getInterestCertificatePDF(this.reportForm.value.clientId, this.reportForm.value.year)
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }
}
