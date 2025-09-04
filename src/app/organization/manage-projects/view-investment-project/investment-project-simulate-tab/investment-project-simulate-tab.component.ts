import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
@Component({
  selector: 'mifosx-investment-project-simulate-tab',
  templateUrl: './investment-project-simulate-tab.component.html',
  styleUrls: ['./investment-project-simulate-tab.component.scss']
})
export class InvestmentProjectSimulateTabComponent implements OnInit {
  idProject: string | number;
  displayedColumns: string[] = [
    'Mnemonic',
    'Creation date',
    'Amount to be Financed',
    'Total interest',
    'Total credit',
    'CAE',
    'Rate',
    'Term',
    'Credit Type',
    'showMore'
  ];
  dataSource: MatTableDataSource<any>;
  projectData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }

  ngOnInit(): void {
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
  }
  generateSimulationPdf() {
    const payload = { projectId: this.idProject };
    this.organizationService.generateSimulationPdf(payload).subscribe((data: any) => {
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // 2. Crear un objeto URL
      const blobUrl = URL.createObjectURL(blob);

      // 3. Crear un enlace y forzar la descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'SimulacionFinanciamiento.pdf';
      document.body.appendChild(link);
      link.click();

      // 4. Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    });
  }
}
