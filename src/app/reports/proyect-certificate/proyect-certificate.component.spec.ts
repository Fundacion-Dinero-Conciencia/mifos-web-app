import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectCertificateComponent } from './proyect-certificate.component';

describe('ProyectCertificateComponent', () => {
  let component: ProyectCertificateComponent;
  let fixture: ComponentFixture<ProyectCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProyectCertificateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProyectCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
