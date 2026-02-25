import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
    username: string;
    token: string;
}

interface AuthData {
    username: string;
    token: string;
    expiresAt: number;
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
        const authDataString = localStorage.getItem('auth_data') || sessionStorage.getItem('auth_data');

        if (authDataString) {
            try {
                const authData: AuthData = JSON.parse(authDataString);
                
                if (Date.now() <= authData.expiresAt) {
                    this.isAuthenticatedSubject.next(true);
                    this.currentUserSubject.next({ 
                        username: authData.username, 
                        token: authData.token 
                    });
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Error loading auth data:', error);
            }
        }
    }

    login(username: string, password: string, rememberMe: boolean = false): boolean {
        if (username && password) {
            const token = 'mock-token-' + Date.now();
            const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

            const authData: AuthData = {
                token: token,
                username: username,
                expiresAt: expiresAt
            };

            if (rememberMe) {
                localStorage.setItem('auth_data', JSON.stringify(authData));
            } else {
                sessionStorage.setItem('auth_data', JSON.stringify(authData));
            }

            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next({ username, token });
            return true;
        }
        return false;
    }

    logout(): void {
        localStorage.removeItem('auth_data');
        sessionStorage.removeItem('auth_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('username');

        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        const authDataString = localStorage.getItem('auth_data') || sessionStorage.getItem('auth_data');
        
        if (!authDataString) {
            return false;
        }

        try {
            const authData: AuthData = JSON.parse(authDataString);
            
            if (Date.now() > authData.expiresAt) {
                console.log('Token expired');
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
}