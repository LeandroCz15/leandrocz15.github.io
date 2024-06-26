import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegerComponent } from './integer.component';

describe('IntegerComponent', () => {
  let component: IntegerComponent;
  let fixture: ComponentFixture<IntegerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegerComponent]
    });
    fixture = TestBed.createComponent(IntegerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
