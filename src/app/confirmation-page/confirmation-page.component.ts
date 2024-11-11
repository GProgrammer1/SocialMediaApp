import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './confirmation-page.component.html',
  styleUrl: './confirmation-page.component.css'
})
export class ConfirmationPageComponent implements OnInit {

  confirmationStatus: string = 'pending';

  resendConfirmationEmail() {
    const email = sessionStorage.getItem('email');
    this.http.post('http://localhost:3000/auth/resendConfirmation', { email }).subscribe({
      next: (response: any) => {
        this.confirmationStatus = 'success';
        sessionStorage.setItem('email', response.email);
        sessionStorage.setItem('emailToken', response.emailToken);
        console.log('email sent');
      },
      error: err => {
        this.confirmationStatus = 'failure';
        console.log('error: ', err);
      }
    });
  }

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const token = window.location.href.split('/').pop();
    console.log(token);
    
    if (token) {
      this.http.get(`http://localhost:3000/auth/confirm/${token}`).subscribe({
        next: (response: any) => {
          if (response.email) {
            console.log(response.email);
            
            console.log('confirmed');
            sessionStorage.setItem('email', response.email);
            this.confirmationStatus = 'success';
          }
          
        },
        error: () => {
          this.confirmationStatus = 'failure';
        }
      });
    }
  }

}
