import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'


export const authGuard: CanActivateFn = (route, state) => {


  // TODO: Inject AuthService using inject()
  const authService = inject(AuthService);
  // Hint: const authService = inject(AuthService);
  // TODO: Inject Router
  const router = inject(Router);
  // Hint: const router = inject(Router);
  // let check is user authenticated
  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'])
  return false;

};
