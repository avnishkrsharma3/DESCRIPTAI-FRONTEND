import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  submitted = false;
  username = '';
  password = '';

  // Signals so the view refreshes even when change detection is zoneless
  errorMessage = signal('');
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [this.username, [Validators.required, Validators.minLength(3)]],
      // No length rule on login: the backend decides if the password is right
      password: [this.password, [Validators.required]],
      rememberMe: [true]
    });
  }

  // Getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.submitted = true;
    this.errorMessage.set('');

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    // Guard against double-submit while a request is in flight
    if (this.isSubmitting()) {
      return;
    }

    const { username, password, rememberMe } = this.loginForm.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    this.isSubmitting.set(true);
    const startedAt = Date.now();

    this.authService.login(username, password, rememberMe).subscribe({
      next: () => {
        // Never log the token or the password
        console.log('[Login] success', {
          username,
          durationMs: Date.now() - startedAt,
          returnUrl,
          timestamp: new Date().toISOString()
        });

        this.isSubmitting.set(false);

        this.router.navigateByUrl(returnUrl).then(
          (success) => console.log('[Login] navigation result:', success)
        ).catch(
          (error) => console.error('[Login] navigation error:', error)
        );
      },

      error: (error: HttpErrorResponse) => {
        const backendMessage = this.extractMessage(error);

        // Never log the password
        console.error('[Login] failed', {
          username,
          status: error.status,
          serverMessage: backendMessage,
          durationMs: Date.now() - startedAt,
          timestamp: new Date().toISOString()
        });

        this.isSubmitting.set(false);

        if (error.status === 0) {
          this.errorMessage.set('Cannot reach the server. Check your connection.');
        } else if (error.status === 400 || error.status === 401 || error.status === 403) {
          this.errorMessage.set(backendMessage || 'Invalid username or password');
        } else {
          this.errorMessage.set(backendMessage || 'Something went wrong. Please try again.');
        }
      }
    });
  }

  // Pulls the backend's message out of the error body, whatever shape it has
  private extractMessage(error: HttpErrorResponse): string {
    const body = error.error;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;          // {"status":400,"message":"password: ..."}
    }
    if (typeof body === 'string' && body.trim()) {
      return body;                  // plain-text error body
    }
    return '';                      // status 0, empty body, etc.
  }
}