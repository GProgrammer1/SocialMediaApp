import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterLink,
    MatIconModule], 

  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  newPasswordFieldType: string = 'password'; // To control visibility of newPassword field
  confirmPasswordFieldType: string = 'password'; // To control visibility of confirmPassword field
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private snackbar: MatSnackBar) {
    this.resetPasswordForm = this.fb.group({
      newPassword: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
           // Custom validator for password match
        ],
        updateOn: 'change'
      }),
      confirmPassword: new FormControl('', {
        validators: [Validators.required, this.passwordMatchValidator.bind(this)],
        updateOn: 'change'
      })
    });
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(control: FormControl): ValidationErrors | null {
    const password = this.resetPasswordForm?.get('newPassword')?.value;
    const confirmPassword = control.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Method to toggle password visibility
  togglePasswordVisibility(field: 'newPassword' | 'confirmPassword') {
    if (field === 'newPassword') {
      this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
      this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }

  onResetSubmit() {
    if (this.resetPasswordForm.value.newPassword !== this.resetPasswordForm.value.confirmPassword || this.resetPasswordForm.invalid) {
      console.log('Passwords do not match');
      return;
    }

    const token = window.location.href.split('/').pop()!;
    this.loading = true;
    setTimeout(() => {
    this.authService.resetPassword(this.resetPasswordForm.value.newPassword, token).subscribe({
      next: (response: any) => {
        console.log(response);
        sessionStorage.setItem('email', response.email);
        this.snackbar.open('Password has been reset, please login', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.snackbar.open('Error resetting password', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.loading = false;
      }
    })}, 1000);
  }
}
