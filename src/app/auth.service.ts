import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(private http: HttpClient) { }

  resendConfirmationEmail(email: string) {
    return this.http.post('http://localhost:3000/auth/resendConfirmation', { email });
  }

  confirmEmail(token: string) {
    return this.http.get(`http://localhost:3000/auth/confirm/${token}`);
  }

  login(email: string, password: string) {
    return this.http.post('http://localhost:3000/auth/login', { email, password });
  }

  register(name: string, email: string, password: string) {
    return this.http.post('http://localhost:3000/auth/register', {name,  email, password });
  }

  forgotPassword(email: string) {
    return this.http.post('http://localhost:3000/auth/forgotPassword', { email });
  }

  resetPassword(newPassword: string, token: string) {
    return this.http.post(`http://localhost:3000/auth/resetPassword/${token}`, { newPassword });
  }
  
}
