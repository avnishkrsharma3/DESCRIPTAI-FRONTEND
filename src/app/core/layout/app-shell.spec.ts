import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppShell } from './app-shell';
import { Home } from '../../features/home/home';

describe('AppShell', () => {
  let fixture: ComponentFixture<AppShell>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.setItem(
      'auth_data',
      JSON.stringify({ username: 'Avnish', token: 'test-token', expiresAt: Date.now() + 60_000 }),
    );

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'login', component: Home }]),
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should show catalog and approval navigation with logout under the profile', () => {
    const shell = fixture.nativeElement as HTMLElement;
    const profile = shell.querySelector('.profile-menu') as HTMLDetailsElement;

    expect(shell.querySelector('a[href="/products"]')?.textContent).toContain('Product catalog');
    expect(shell.querySelector('a[href="/approve-dashboard"]')?.textContent).toContain('Approvals');
    expect(profile.textContent).toContain('Avnish');
    expect(profile.querySelector('button.logout-button')?.textContent).toContain('Log out');
  });

  it('should clear the session when logging out from the profile menu', () => {
    const logoutButton = fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement;
    logoutButton.click();
    fixture.detectChanges();

    expect(authService.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('auth_data')).toBeNull();
  });
});
