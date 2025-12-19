import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciliationPayinComponent } from './conciliation-payin.component';

describe('ConciliationPayinComponent', () => {
  let component: ConciliationPayinComponent;
  let fixture: ComponentFixture<ConciliationPayinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConciliationPayinComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConciliationPayinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
