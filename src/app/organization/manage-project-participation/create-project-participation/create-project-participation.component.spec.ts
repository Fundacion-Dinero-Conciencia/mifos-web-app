import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectParticipationComponent } from './create-project-participation.component';

describe('CreateProjectParticipationComponent', () => {
  let component: CreateProjectParticipationComponent;
  let fixture: ComponentFixture<CreateProjectParticipationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateProjectParticipationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectParticipationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
