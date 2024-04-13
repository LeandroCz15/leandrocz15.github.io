import { TestBed } from '@angular/core/testing';

import { ProcessExecutorService } from './process-executor.service';

describe('ProcessExecutorService', () => {
  let service: ProcessExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessExecutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
