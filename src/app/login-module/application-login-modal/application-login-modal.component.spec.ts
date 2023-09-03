import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationLoginModalComponent } from './application-login-modal.component';

describe('ApplicationLoginModalComponent', () => {
  let component: ApplicationLoginModalComponent;
  let fixture: ComponentFixture<ApplicationLoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationLoginModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ApplicationLoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
