import { Component, OnInit } from '@angular/core';
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
  errorMessage: string = '';
  showPassword: boolean = false;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  username: string = '';
  password: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [this.username, [Validators.required, Validators.minLength(3)]],
      password: [this.password, [Validators.required, Validators.minLength(6)]],
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
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    // Guard against double-submit while a request is in flight
    if (this.isSubmitting) {
      return;
    }

    const { username, password, rememberMe } = this.loginForm.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';

    this.isSubmitting = true;
    const startedAt = Date.now();

    this.authService.login(username, password, rememberMe).subscribe({
      next: (user) => {
        const durationMs = Date.now() - startedAt;
        console.log('[Login] success', {
          username: user.username,
          durationMs,
          returnUrl,
          timestamp: new Date().toISOString(),
          token: user.token
        });

        this.isSubmitting = false;

        this.router.navigateByUrl(returnUrl).then(
          (success) => console.log('[Login] navigation result:', success)
        ).catch(
          (error) => console.error('[Login] navigation error:', error)
        );
      },
      error: (error: HttpErrorResponse) => {
        const durationMs = Date.now() - startedAt;

        // Structured log for triage: status, message, and context,
        // but never the password.
        console.error('[Login] failed', {
          username,
          status: error.status,
          statusText: error.statusText,
          serverMessage: error.error?.message ?? null,
          durationMs,
          timestamp: new Date().toISOString()
        });

        this.isSubmitting = false;

        if (error.status === 403) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot reach the server. Check your connection.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}