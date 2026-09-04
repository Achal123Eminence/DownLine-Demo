import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';

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
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any = null;
  showPassword = false;
  showConfirmPassword = false;

  private wholeNumberValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (value === null || value === '') {
      return null;
    }

    return Number.isInteger(Number(value))
      ? null
      : { wholeNumber: true };
  }

  private twoDecimalValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (value === null || value === '') {
      return null;
    }

    const stringValue = String(value);

    return /^\d+(\.\d{1,2})?$/.test(stringValue)
      ? null
      : { decimalPlaces: true };
  }

  private partnershipAvailableValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!this.currentUser || control.value === null || control.value === '') {
      return null;
    }

    return Number(control.value) > this.currentUser.partnership
      ? { insufficientPartnership: true }
      : null;
  }

  private commissionAvailableValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!this.currentUser || control.value === null || control.value === '') {
      return null;
    }

    return Number(control.value) > this.currentUser.commission
      ? { insufficientCommission: true }
      : null;
  }

  createUserForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        this.usernameStartValidator.bind(this)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
      ]
    ],

    confirmPassword: [
      '',
      [
        Validators.required
      ]
    ],

    partnership: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        this.wholeNumberValidator.bind(this),
        this.partnershipAvailableValidator.bind(this),
      ]
    ],

    commission: [
      0,
      [
        Validators.required,
        // Validators.min(0),
        // Validators.max(100),
        this.twoDecimalValidator.bind(this),
        this.commissionAvailableValidator.bind(this)
      ]
    ]
  },
  {
    validators: this.passwordMatchValidator.bind(this)
  });

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    this.createUserForm.controls.partnership.updateValueAndValidity();
    this.createUserForm.controls.commission.updateValueAndValidity();
  }

  get createRole(): string {

    switch (this.currentUser?.level) {

      case 1:
        return 'Sub Admin';

      case 2:
        return 'Admin';

      case 3:
        return 'Agent';

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

    const { confirmPassword, ...payload } = this.createUserForm.getRawValue();

    // const payload = this.createUserForm.getRawValue();

    this.api.createUser(payload).subscribe({

      next: (response: any) => {

        console.log('Create user response:', response);

        this.isLoading = false;

        Swal.fire({
          icon: 'success',
          title: 'Success',
          timer: 1000,
          text: response.message || 'User created successfully',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-font'
          }
        }).then(() => {
          this.router.navigate(['/downline']);
        });
      },

      error: (error) => {

        console.error('Create user error:', error);

        this.isLoading = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          timer: 1000,
          text: error.error?.message || 'Unable to create user. Please try again.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-font'
          }
        });
      }
    });
  }

  cancel() {
    this.router.navigate(['/downline']);
  }

  preventNegative(event: KeyboardEvent) {
    if (
      event.key === '-' ||
      event.key === 'e' ||
      event.key === 'E'
    ) {
      event.preventDefault();
    }
  }

  preventInvalidNumberPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (!/^\d*\.?\d*$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  preventInvalidUsername(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^[a-zA-Z0-9_-]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  preventInvalidUsernamePaste(event: ClipboardEvent) {
    const pastedText =
      event.clipboardData?.getData('text') ?? '';

    if (!/^[a-zA-Z0-9_-]+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  private usernameStartValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    return /^[a-zA-Z]/.test(value)
      ? null
      : { usernameStart: true };
  }
}
