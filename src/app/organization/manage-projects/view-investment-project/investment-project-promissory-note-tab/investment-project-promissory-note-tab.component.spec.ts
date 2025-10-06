import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentProjectPromissoryNoteTabComponent } from './investment-project-promissory-note-tab.component';

describe('InvestmentProjectPromissoryNoteTabComponent', () => {
  let component: InvestmentProjectPromissoryNoteTabComponent;
  let fixture: ComponentFixture<InvestmentProjectPromissoryNoteTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestmentProjectPromissoryNoteTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentProjectPromissoryNoteTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
