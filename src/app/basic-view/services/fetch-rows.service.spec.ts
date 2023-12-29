import { TestBed } from '@angular/core/testing';

import { FetchRowsService } from './fetch-rows.service';

describe('FetchRowsService', () => {
  let service: FetchRowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchRowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
