import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

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
    RouterLink,
    CommonModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  passwordFieldType: string = 'password';
  passwordConfirmationFieldType: string = 'password';
  passwordStrength: string = '';

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change',
        nonNullable: true
      }),
      fullName: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'change',
        nonNullable: true
      }),
      password: new FormControl('', {
        updateOn: 'change',
        nonNullable: true,
        validators: [Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
                      Validators.maxLength(20),
                      Validators.required
                    ]
      }),
      passwordConfirmation: new FormControl('', {
        validators: [Validators.required, this.passwordsMatchValidator],
        updateOn: 'blur',
        nonNullable: true
        
      })
    });
    
  }

  onSubmit() {
    console.log(this.signupForm.value);
  }

  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const passwordConfirmation = group.get('passwordConfirmation')?.value;

    return ( password && passwordConfirmation ) && (password === passwordConfirmation) ? null : { 'passwordMismatch': true };
  }

  togglePasswordFieldType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  togglePasswordConfirmationFieldType() {
    this.passwordConfirmationFieldType = this.passwordConfirmationFieldType === 'password' ? 'text' : 'password';
  }

}
