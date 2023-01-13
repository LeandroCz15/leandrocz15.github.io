import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraLoginModalComponent } from './jira-login-modal.component';

describe('JiraLoginModalComponent', () => {
  let component: JiraLoginModalComponent;
  let fixture: ComponentFixture<JiraLoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JiraLoginModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraLoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
