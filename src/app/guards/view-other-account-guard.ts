import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const viewOtherAccountGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const me = auth.getCurrentUser();

  const targetUserId = route.paramMap.get('id');
  if (targetUserId && targetUserId === String(me?.id)) return true;

  const isAdmin = me?.role === 'admin' || me?.role === 'super';
  if (isAdmin) {
    return true;
  }
  return router.navigate(['/account']);
  
};
