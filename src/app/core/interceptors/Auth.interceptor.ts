import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional interceptor (Angular 15+/standalone style).
 * Attaches "Authorization: Bearer <token>" to outgoing requests when a
 * token is present, and logs the user out if the backend responds 403
 * (access denied / bad or expired token).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // 401 = missing/invalid/expired token -> the session itself is bad, log out.
            // 403 = token is valid but the user lacks permission (e.g. non-admin
            // hitting an admin-only route) -> do NOT log out, just let the
            // component handle the error.
            if (error.status === 401) {
                authService.logout();
            }
            return throwError(() => error);
        })
    );
};