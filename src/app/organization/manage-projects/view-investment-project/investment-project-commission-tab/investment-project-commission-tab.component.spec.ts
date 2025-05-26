/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InvestmentProjectCommissionTabComponent } from './investment-project-commission-tab.component';

describe('InvestmentProjectCommissionTabComponent', () => {
  let component: InvestmentProjectCommissionTabComponent;
  let fixture: ComponentFixture<InvestmentProjectCommissionTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentProjectCommissionTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentProjectCommissionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
