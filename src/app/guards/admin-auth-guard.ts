import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Membership } from '../interface';
import { map } from 'rxjs/operators';

export const adminAuthGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loggedUser = auth.getCurrentUser();

  const isAdmin = auth.fetchMembership(loggedUser?._id || '').pipe(
    map ( (m: Membership | null) => m?.role === 'admin')
  )

  const isSuper = loggedUser?.isSuper;
  if (isAdmin || isSuper) {
    return true;
  }
  return router.navigate(['/account']);
};
