import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientIdentifiersDialogComponent } from './client-identifiers-dialog.component';

describe('ClientIdentifiersDialogComponent', () => {
  let component: ClientIdentifiersDialogComponent;
  let fixture: ComponentFixture<ClientIdentifiersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientIdentifiersDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientIdentifiersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
