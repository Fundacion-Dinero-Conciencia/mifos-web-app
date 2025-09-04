import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectSimulateTabComponent } from './investment-project-simulate-tab.component';

describe('InvestmentProjectSimulateTabComponent', () => {
  let component: InvestmentProjectSimulateTabComponent;
  let fixture: ComponentFixture<InvestmentProjectSimulateTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectSimulateTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectSimulateTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
