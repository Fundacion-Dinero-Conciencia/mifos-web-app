import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectImpactTabComponent } from './investment-project-impact-tab.component';

describe('InvestmentProjectImpactTabComponent', () => {
  let component: InvestmentProjectImpactTabComponent;
  let fixture: ComponentFixture<InvestmentProjectImpactTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectImpactTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectImpactTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
