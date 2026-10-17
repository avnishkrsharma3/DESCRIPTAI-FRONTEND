import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs';

import { environment } from '../../../environments/environment';

interface User {
    username: string;
    token: string;
}

interface AuthData {
    username: string;
    token: string;
    expiresAt: number;
}

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
}

interface RegisterRequest {
    username: string;
    password: string;
}

interface RegisterResponse {
    message: string;
}

interface JwtPayload {
    sub?: string;
    iat?: number;
    exp: number;
    [key: string]: unknown;
}

const AUTH_STORAGE_KEY = 'auth_data';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient, { optional: true });
    private readonly apiUrl = environment.apiUrl;

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        const authDataString = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);

        if (authDataString) {
            try {
                const authData: AuthData = JSON.parse(authDataString);

                if (Date.now() <= authData.expiresAt) {
                    this.isAuthenticatedSubject.next(true);
                    this.currentUserSubject.next({
                        username: authData.username,
                        token: authData.token,
                    });
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Error loading auth data:', error);
            }
        }
    }

    login(username: string, password: string, rememberMe: boolean = false): Observable<User> {
        const body: LoginRequest = { username, password };

        if (!this.http) {
            return throwError(() => new Error('HttpClient is not available.'));
        }

        return this.http.post<LoginResponse>(`${this.apiUrl}/v1/auth/login`, body).pipe(
            map((response) => this.persistSession(response.token, username, rememberMe)),
            catchError((error: HttpErrorResponse) => this.handleAuthError(error)),
        );
    }

    register(username: string, password: string): Observable<string> {
        const body: RegisterRequest = { username, password };

        if (!this.http) {
            return throwError(() => new Error('HttpClient is not available.'));
        }

        return this.http.post<RegisterResponse>(`${this.apiUrl}/v1/auth/register`, body).pipe(
            map((response) => response.message),
            catchError((error: HttpErrorResponse) => this.handleAuthError(error)),
        );
    }

    logout(): void {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);

        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        const authDataString = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);

        if (!authDataString) {
            return false;
        }

        try {
            const authData: AuthData = JSON.parse(authDataString);

            if (Date.now() > authData.expiresAt) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error parsing auth data:', error);
            return false;
        }
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        const authDataString = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (!authDataString) {
            return null;
        }
        try {
            const authData: AuthData = JSON.parse(authDataString);
            return authData.token;
        } catch {
            return null;
        }
    }

    private persistSession(token: string, username: string, rememberMe: boolean): User {
        const expiresAt = this.getExpiryFromToken(token);

        const authData: AuthData = { token, username, expiresAt };

        if (rememberMe) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } else {
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        }

        const user: User = { username, token };
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(user);
        return user;
    }

    private getExpiryFromToken(token: string): number {
        try {
            const payloadBase64 = token.split('.')[1];
            const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = atob(normalized);
            const payload: JwtPayload = JSON.parse(payloadJson);
            return payload.exp * 1000;
        } catch (error) {
            console.error('Failed to decode JWT, falling back to 1 hour expiry:', error);
            return Date.now() + 60 * 60 * 1000;
        }
    }

    private handleAuthError(error: HttpErrorResponse) {
        if (error.status === 403) {
            console.error('Login failed: invalid credentials or access denied.');
        } else {
            console.error('Login request failed:', error.message);
        }
        return throwError(() => error);
    }
}
