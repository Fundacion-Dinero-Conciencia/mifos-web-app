import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSubcreditsComponent } from './pending-subcredits.component';

describe('PendingSubcreditsComponent', () => {
  let component: PendingSubcreditsComponent;
  let fixture: ComponentFixture<PendingSubcreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingSubcreditsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingSubcreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
