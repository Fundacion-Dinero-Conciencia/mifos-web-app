import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSimulationComponent } from './payment-simulation.component';

describe('PaymentSimulationComponent', () => {
  let component: PaymentSimulationComponent;
  let fixture: ComponentFixture<PaymentSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentSimulationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
