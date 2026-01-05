import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciliationPayoutComponent } from './conciliation-payout.component';

describe('ConciliationPayoutComponent', () => {
  let component: ConciliationPayoutComponent;
  let fixture: ComponentFixture<ConciliationPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConciliationPayoutComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConciliationPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
