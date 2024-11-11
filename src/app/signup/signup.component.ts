import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  passwordFieldType: string = 'password';
  passwordConfirmationFieldType: string = 'password';
  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService,
    private snackBar: MatSnackBar) {

    this.signupForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
        Validators.maxLength(20)
      ]),
      passwordConfirmation: new FormControl('', [
        Validators.required, 
        Validators.maxLength(20),
        this.passwordMatchValidator.bind(this) // Custom validator for password match
      ])
    });
  }

  // Custom validator for password confirmation
  passwordMatchValidator(control: FormControl): ValidationErrors | null {
    const password = this.signupForm?.get('password')?.value;
    const passwordConfirmation = control.value;

    if (password !== passwordConfirmation) {
      return { passwordMismatch: true }; // Return error object if passwords don't match
    }
    return null; // Return null if passwords match
  }

  // Getter to check password matching status
  get passwordMismatchError(): boolean {
    return this.signupForm.get('passwordConfirmation')?.hasError('passwordMismatch') ?? false;
  }

  onSubmit() {
    if (this.signupForm.invalid || this.passwordMismatchError) {
      return;  // Exit if form is invalid or passwords don't match
    }

    const { name, email, password } = this.signupForm.getRawValue();
    this.loading = true;

    this.authService.register(name, email, password).subscribe({
      next: (response: any) => {
        console.log(response);
        sessionStorage.setItem('authToken', response.authToken);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('emailToken', response.emailToken);

        this.snackBar.open('Account created successfully and an email has been sent. Please go to your gmail and press the verification link', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'success-snackbar'
        });

        this.loading = false;
      },
      error: err => {
        console.log('Error:', err.message);
        this.loading = false;
      }
    });
  }

  

  togglePasswordFieldType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  togglePasswordConfirmationFieldType() {
    this.passwordConfirmationFieldType = this.passwordConfirmationFieldType === 'password' ? 'text' : 'password';
  }
}
