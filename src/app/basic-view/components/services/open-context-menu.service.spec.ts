import { TestBed } from '@angular/core/testing';

import { OpenContextMenuService } from './open-context-menu.service';

describe('OpenContextMenuService', () => {
  let service: OpenContextMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenContextMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
