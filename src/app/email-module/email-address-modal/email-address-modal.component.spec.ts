import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAddressModalComponent } from './email-address-modal.component';

describe('EmailAddressModalComponent', () => {
  let component: EmailAddressModalComponent;
  let fixture: ComponentFixture<EmailAddressModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailAddressModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
