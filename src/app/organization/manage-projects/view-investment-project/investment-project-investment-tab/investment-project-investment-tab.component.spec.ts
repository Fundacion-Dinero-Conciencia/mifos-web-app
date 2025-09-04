import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectInvestmentTabComponent } from './investment-project-investment-tab.component';

describe('InvestmentProjectInvestmentTabComponent', () => {
  let component: InvestmentProjectInvestmentTabComponent;
  let fixture: ComponentFixture<InvestmentProjectInvestmentTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectInvestmentTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectInvestmentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
