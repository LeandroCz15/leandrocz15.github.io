import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPageIndexComponent } from './main-page-index.component';

describe('MainPageIndexComponent', () => {
  let component: MainPageIndexComponent;
  let fixture: ComponentFixture<MainPageIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainPageIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPageIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
