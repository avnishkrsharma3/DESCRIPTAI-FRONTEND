import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[Guard] checking auth, isLoggedIn:', authService.isLoggedIn());
  if (authService.isLoggedIn()) {
    return true;
  }

  // Preserve the URL the user was trying to reach so LoginComponent
  // can redirect back after a successful login.
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};