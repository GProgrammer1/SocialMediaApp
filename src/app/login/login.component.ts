import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, RouterLink,
    MatCheckboxModule, ReactiveFormsModule, MatIconModule, CommonModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm : FormGroup ;
  loading = false;

  passwordFieldType = 'password';
  constructor(private fb: FormBuilder, private authService: AuthService, private snack: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true
      }),
      
      password: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true
      })
     
    });

  } //end constructor

  
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.loading = true;
    console.log('Email:', email);
    console.log('Password:',  password);
    setTimeout(() => {
    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        const token = response.authToken;
        
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        this.loading = false;
        this.router.navigate(['/home']);
        
      },
      error: (error: {err: string}) => {
        console.log('Error:', error);
        this.loading = false;

        if (error.err === 'Account is inactive') {
          const snackRef = this.snack.open('Account is inactive', 'Activate', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          snackRef.onAction().subscribe(() => {
            
            this.activateAccount(email);
          });
        } else {
          this.snack.open('Invalid email or password', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loginForm.reset();
        }
      }
    });
  }, 1000);
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  activateAccount(email: string) {

    this.loading = true;
    setTimeout(() => {
    this.authService.activateAccount(email).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        this.snack.open('Account activated successfully', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.log('Error:', error);
        this.snack.open('Error activating account', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loading = false;
      }
    })}, 1000);
  }
}
