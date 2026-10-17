import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.css']
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService, { optional: true });
  private readonly router = inject(Router, { optional: true });

  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  submitted = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onRegister(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    const { name, password } = this.registerForm.value;

    if (!this.authService) {
      this.errorMessage = 'Registration service is unavailable. Please try again later.';
      return;
    }

    this.authService.register(name, password).subscribe({
      next: (message) => {
        this.successMessage = message || 'Registration successful!';
        this.registerForm.reset();
        setTimeout(() => this.router?.navigate(['/login']), 300);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
