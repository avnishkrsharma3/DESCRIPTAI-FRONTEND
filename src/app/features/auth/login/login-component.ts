import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['avnish', [Validators.required, Validators.minLength(3)]],
      password: ['avnishkumar', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
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

    const { username, password, rememberMe } = this.loginForm.value;

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products'
    if (this.authService.login(username, password, rememberMe)) {
      // TODO: Get returnUrl from query params

      console.log(returnUrl)
      this.router.navigateByUrl(returnUrl).then(
        (success) => console.log('Navigation result:', success)
      ).catch(
        (error) => console.log('Navigation error:', error)
      );
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}