import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectNotesTabComponent } from './investment-project-notes-tab.component';

describe('InvestmentProjectNotesTabComponent', () => {
  let component: InvestmentProjectNotesTabComponent;
  let fixture: ComponentFixture<InvestmentProjectNotesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectNotesTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectNotesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
