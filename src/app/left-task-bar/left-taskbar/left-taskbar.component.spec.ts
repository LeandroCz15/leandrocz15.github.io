import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftTaskbarComponent } from './left-taskbar.component';

describe('LeftTaskbarComponent', () => {
  let component: LeftTaskbarComponent;
  let fixture: ComponentFixture<LeftTaskbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeftTaskbarComponent]
    });
    fixture = TestBed.createComponent(LeftTaskbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
