import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
    username: string;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        // Check if user was already logged in (Remember Me)
        const token = localStorage.getItem('auth_token');
        const username = localStorage.getItem('username');

        if (token && username) {
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next({ username, token });
        }
    }

    login(username: string, password: string, rememberMe: boolean = false): boolean {
        // Mock login - accept any credentials that meet validation
        if (username && password) {
            const token = 'mock-token-' + Date.now();

            if (rememberMe) {
                // Store in localStorage for persistence
                localStorage.setItem('auth_token', token);
                localStorage.setItem('username', username);
            } else {
                // Store in sessionStorage (cleared when browser closes)
                sessionStorage.setItem('auth_token', token);
                sessionStorage.setItem('username', username);
            }

            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next({ username, token });
            return true;
        }
        return false;
    }

    logout(): void {
        // Clear both localStorage and sessionStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('username');

        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}