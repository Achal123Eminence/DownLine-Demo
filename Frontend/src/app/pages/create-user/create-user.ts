import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  imports: [ReactiveFormsModule, Header, Footer],
  selector: 'app-create-user',
  styleUrl: './create-user.css',
  templateUrl: './create-user.html',
  standalone: true
})
export class CreateUser {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any = null;
  createUserForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72)
      ]
    ],

    partnership: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]
    ],

    commission: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]
    ]
  });

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  get createRole(): string {

    switch (this.currentUser?.level) {

      case 1:
        return 'Sub Admin';

      case 2:
        return 'Admin';

      case 3:
        return 'User';

      default:
        return '';
    }
  }

  onSubmit() {

    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.createUserForm.getRawValue();

    this.api.createUser(payload).subscribe({

      next: (response: any) => {

        console.log('Create user response:', response);

        this.isLoading = false;

        this.successMessage =
          response.message || 'User created successfully';

        // Go back to downline after successful creation
        this.router.navigate(['/downline']);
      },

      error: (error) => {

        console.error('Create user error:', error);

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to create user. Please try again.';
      }
    });
  }

  cancel() {
    this.router.navigate(['/downline']);
  }
}
