import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { viewOtherAccountGuard } from './view-other-account-guard';

describe('viewOtherAccountGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => viewOtherAccountGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
