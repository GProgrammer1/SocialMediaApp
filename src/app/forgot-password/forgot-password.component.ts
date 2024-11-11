import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [MatFormField, MatInputModule, MatButtonModule, ReactiveFormsModule, CommonModule, RouterLink,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  forgotPasswordForm : FormGroup;
  loading = false;
  constructor(private fb: FormBuilder, private authService: AuthService, private snack: MatSnackBar) {
    
    this.forgotPasswordForm = this.fb.group({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change',
        nonNullable: true
      })
    });
  }

  
  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe(
        {
          next: (response: any) => {
            const email = this.forgotPasswordForm.value.email;
            sessionStorage.setItem('email', email);
            sessionStorage.setItem('resetToken', response.resetToken);
            this.snack.open('Password reset link sent to email', 'Close', {

              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'

            });
            console.log(response);
            this.loading = false;

        },
        error: (error: any) => {
          this.loading = false;

          this.snack.open('Invalid email', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
          this.forgotPasswordForm.reset();
          console.error(error);
        }
    })}, 1000); 
  }
}
