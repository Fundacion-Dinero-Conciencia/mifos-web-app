import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectTabComponent } from './investment-project-documents-tab.component';

describe('InvestmentProjectGeneralTabComponent', () => {
  let component: InvestmentProjectTabComponent;
  let fixture: ComponentFixture<InvestmentProjectTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
