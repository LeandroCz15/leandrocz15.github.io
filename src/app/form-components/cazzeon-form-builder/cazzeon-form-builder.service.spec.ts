import { TestBed } from '@angular/core/testing';

import { CazzeonFormBuilderService } from './cazzeon-form-builder.service';

describe('CazzeonFormBuilderService', () => {
  let service: CazzeonFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CazzeonFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
