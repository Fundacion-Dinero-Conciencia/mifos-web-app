import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcreditsComponent } from './subcredits.component';

describe('SubcreditsComponent', () => {
  let component: SubcreditsComponent;
  let fixture: ComponentFixture<SubcreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubcreditsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SubcreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
