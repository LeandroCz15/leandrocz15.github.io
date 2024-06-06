import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalComponent } from './decimal.component';

describe('DecimalComponent', () => {
  let component: DecimalComponent;
  let fixture: ComponentFixture<DecimalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DecimalComponent]
    });
    fixture = TestBed.createComponent(DecimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
