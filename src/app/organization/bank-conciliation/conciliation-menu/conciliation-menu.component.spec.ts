import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciliationMenuComponent } from './conciliation-menu.component';

describe('ConciliationMenuComponent', () => {
  let component: ConciliationMenuComponent;
  let fixture: ComponentFixture<ConciliationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConciliationMenuComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConciliationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
