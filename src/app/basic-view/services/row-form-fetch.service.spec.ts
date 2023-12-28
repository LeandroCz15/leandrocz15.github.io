import { TestBed } from '@angular/core/testing';

import { RowFormFetchService } from './row-form-fetch.service';

describe('RowFormFetchService', () => {
  let service: RowFormFetchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RowFormFetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
