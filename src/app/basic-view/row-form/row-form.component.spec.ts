import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowFormComponent } from './row-form.component';

describe('RowFormComponent', () => {
  let component: RowFormComponent;
  let fixture: ComponentFixture<RowFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RowFormComponent]
    });
    fixture = TestBed.createComponent(RowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
