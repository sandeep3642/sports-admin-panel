import { TestBed } from '@angular/core/testing';

import { AuthintereptorService } from './authintereptor.service';

describe('AuthintereptorService', () => {
  let service: AuthintereptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthintereptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
