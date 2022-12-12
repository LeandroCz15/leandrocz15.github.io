import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarElementComponent } from './navbarelement.component';

describe('NavbarElementComponent', () => {
  let component: NavbarElementComponent;
  let fixture: ComponentFixture<NavbarElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
