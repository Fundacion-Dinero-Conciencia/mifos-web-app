import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtCertificateComponent } from './debt-certificate.component';

describe('DebtCertificateComponent', () => {
  let component: DebtCertificateComponent;
  let fixture: ComponentFixture<DebtCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebtCertificateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
