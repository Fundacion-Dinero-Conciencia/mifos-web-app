import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientIdentifiersStepComponent } from './client-identifiers-step.component';

describe('ClientIdentifiersStepComponent', () => {
  let component: ClientIdentifiersStepComponent;
  let fixture: ComponentFixture<ClientIdentifiersStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientIdentifiersStepComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientIdentifiersStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
