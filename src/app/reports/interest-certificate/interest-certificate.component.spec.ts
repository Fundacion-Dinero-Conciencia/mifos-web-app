import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestCertificateComponent } from './interest-certificate.component';

describe('InterestCertificateComponent', () => {
  let component: InterestCertificateComponent;
  let fixture: ComponentFixture<InterestCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterestCertificateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InterestCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
