import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ClientsService } from 'app/clients/clients.service';
import { ReportsService } from '../reports.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mifosx-interest-certificate',
  templateUrl: './interest-certificate.component.html',
  styleUrls: ['./interest-certificate.component.scss']
})
export class InterestCertificateComponent implements OnInit, AfterViewInit {
  reportForm: UntypedFormGroup;
  clientsData: any[] = [];
  years: number[] = [];
  loading = false;
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
      client: [
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
    this.reportForm.controls.client.valueChanges.subscribe((value: string) => {
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
    this.loading = true;
    this.reportsService
      .getInterestCertificatePDF(this.reportForm.value.client.id, this.reportForm.value.year)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }
}
