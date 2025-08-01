import { TestBed } from '@angular/core/testing';

import { StackholderService } from './stackholder.service';

describe('StackholderService', () => {
  let service: StackholderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StackholderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
