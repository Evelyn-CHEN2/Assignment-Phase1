import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const me = auth.getCurrentUser();

  const targetUserId = route.paramMap.get('id');
  if (targetUserId && targetUserId === String(me?.id)) return true;

  const isAdmin = me?.role.includes('admin') || me?.role.includes('super');
  if (isAdmin) {
    return true;
  }
  return router.navigate(['/account']);
};
