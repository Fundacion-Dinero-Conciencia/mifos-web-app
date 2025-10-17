import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPromissoryNoteComponent } from './edit-promissory-note.component';

describe('EditPromissoryNoteComponent', () => {
  let component: EditPromissoryNoteComponent;
  let fixture: ComponentFixture<EditPromissoryNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPromissoryNoteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPromissoryNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
