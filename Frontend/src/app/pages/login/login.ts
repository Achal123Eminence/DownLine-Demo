import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Api } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
  standalone: true,
})
export class Login {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.api.login(this.loginForm.getRawValue()).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);

        
        // Data in local for temp. after basic structure i will upgrade it 
        localStorage.setItem(
          'accessToken',
          response.data.accessToken
        );
        
        localStorage.setItem(
          'user',
          JSON.stringify(response.data.user)
        );
        
        this.isLoading = false;
        this.router.navigate(['/downline']);
      },

      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}