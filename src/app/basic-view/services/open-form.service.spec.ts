import { TestBed } from '@angular/core/testing';

import { OpenFormService } from './open-form.service';

describe('OpenFormService', () => {
  let service: OpenFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
