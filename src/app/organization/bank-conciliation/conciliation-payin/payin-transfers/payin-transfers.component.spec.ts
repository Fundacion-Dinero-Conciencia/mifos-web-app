import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayinTransfersComponent } from './payin-transfers.component';

describe('PayinTransfersComponent', () => {
  let component: PayinTransfersComponent;
  let fixture: ComponentFixture<PayinTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayinTransfersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PayinTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
