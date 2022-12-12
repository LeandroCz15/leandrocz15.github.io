import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUserModalComponent } from './search-user-modal.component';

describe('SearchUserModalComponent', () => {
  let component: SearchUserModalComponent;
  let fixture: ComponentFixture<SearchUserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchUserModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
