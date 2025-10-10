import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'mifosx-edit-promissory-note',
  templateUrl: './edit-promissory-note.component.html',
  styleUrls: ['./edit-promissory-note.component.scss']
})
export class EditPromissoryNoteComponent implements OnInit {
  loading = false;
  projectData: any;
  currency: string;
  clientClassificationTypeOptions: any;
  PromissoryNoteGroup: any;
  selectedInvestments: any[] = [];

  clientForm: UntypedFormGroup;
  filters: UntypedFormGroup;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceLegal: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceAval: MatTableDataSource<any> = new MatTableDataSource<any>();

  displayedColumns: string[] = [
    'Investor',
    'Date',
    'Value invested',
    'Group'
  ];
  displayedColumnsLegal: string[] = [
    'add',
    'name',
    'lastName'
  ];
  displayedColumnsAval: string[] = [
    'add',
    'name',
    'lastName',
    'adress'
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private systemService: SystemService
  ) {
    this.route.data.subscribe((data: { accountData: any; PromissoryNoteGroup: any; clientTemplate: any }) => {
      this.projectData = data.accountData;
      this.clientClassificationTypeOptions = data.clientTemplate.clientClassificationOptions;
      this.PromissoryNoteGroup = data.PromissoryNoteGroup;
      this.dataSource.data = this.PromissoryNoteGroup.investmentList;
    });
  }

  getDefaultCurrency() {
    this.systemService.getConfigurationByName(SettingsService.default_currency).subscribe((data) => {
      this.currency = data.stringValue;
    });
  }

  resetFilters() {
    this.filters.reset();
    this.dataSource.data = this.PromissoryNoteGroup.investmentList;
  }

  ngOnInit(): void {
    this.filters = this.formBuilder.group({
      clientClassificationId: [
        ''
      ],
      name: [
        ''
      ]
    });
    this.filters.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      const filteredData = this.PromissoryNoteGroup.investmentList.filter((investment: any) => {
        return (
          (values.clientClassificationId
            ? (investment.clientClassification ? investment.clientClassification.id : 296) ===
              values.clientClassificationId
            : true) &&
          (values.name ? investment.participantName.toLowerCase().includes(values.name.toLowerCase()) : true)
        );
      });
      this.dataSource.data = filteredData;
    });
    this.getDefaultCurrency();
    this.clientForm = this.formBuilder.group({
      documentNumber: [
        '',
        Validators.required
      ],
      date: [
        '',
        Validators.required
      ],
      mnemonic: [
        '',
        Validators.required
      ]
    });
  }

  get amountOfInvestorsSelected() {
    let total = 0;
    this.selectedInvestments.forEach((invest) => {
      total = total + invest.amount;
    });
    return total;
  }

  onInvestorSelected(event: { checked: boolean }, invest: any) {
    if (event.checked) {
      this.selectedInvestments.push(invest);
    } else {
      const index = this.selectedInvestments.indexOf(invest);
      if (index > -1) {
        this.selectedInvestments.splice(index, 1);
      }
    }
    console.log(this.selectedInvestments);
  }
}
