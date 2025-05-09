import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { ClientsService } from 'app/clients/clients.service';
import { ProjectsService } from '../../manage-projects/manage-projects.service';

@Component({
  selector: 'mifosx-create-project-participation',
  templateUrl: './create-project-participation.component.html',
  styleUrls: ['./create-project-participation.component.scss']
})
export class CreateProjectParticipationComponent implements OnInit {
  projectParticipationsData: any[] = [];
  dataSource: MatTableDataSource<any>;
  projectParticipationForm: UntypedFormGroup;
  participantsData: any[] = [];
  projectsData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private translateService: TranslateService,
    private organizationService: OrganizationService,
    private clientsService: ClientsService,
    private projectsService: ProjectsService
  ) {
    this.route.data.subscribe((data: { projectparticipations: any }) => {
      this.projectParticipationsData = [];
      if (data.projectparticipations) {
        data.projectparticipations.forEach((item: any) => {
          item.createdOnDate = new Date(item.createdOnDate);
          this.projectParticipationsData.push(item);
        });
        this.dataSource = new MatTableDataSource(this.projectParticipationsData);
      }
      this.participantsData = [];
      this.projectsData = [];
    });
  }

  ngOnInit(): void {
    this.setupProjectPArticipationForm();
    this.dataSource = new MatTableDataSource(this.projectParticipationsData);
  }

  setupProjectPArticipationForm() {
    this.projectParticipationForm = this.formBuilder.group({
      participantId: [
        '',
        Validators.required
      ],
      projectId: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ],
      commission: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Displays Project name in form control input.
   * @param {any} project Project data.
   * @returns {string} Project name if valid otherwise undefined.
   */
  displayProject(project: any): string | undefined {
    return project ? project.name : undefined;
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayParticipant(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  submit() {
    const payload = {
      ...this.projectParticipationForm.getRawValue()
    };
    const participant: any = payload['participantId'];
    payload['participantId'] = participant['id'];
    const project: any = payload['projectId'];
    payload['projectId'] = project['id'];
    payload['amount'] = payload['amount'] * 1;
    payload['commission'] = payload['commission'] * 1;
    payload['status'] = 400;
    payload['type'] = 'MANUAL';
    this.organizationService.createInvestmentProjectParticipations(payload).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  ngAfterViewInit() {
    this.projectParticipationForm.controls.projectId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.projectsService.getFilteredProjects(value).subscribe((data: any) => {
          this.projectsData = data;
        });
      }
    });

    this.projectParticipationForm.controls.participantId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
          this.participantsData = data.pageItems;
        });
      }
    });
  }
}
