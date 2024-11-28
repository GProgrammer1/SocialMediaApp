import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  activateAccount(email: string) {
    return this.http.post('http://localhost:3000/auth/activate', { email });
  }


  constructor(private http: HttpClient) { }

  resendConfirmationEmail(email: string) {
    return this.http.post('http://localhost:3000/auth/resendConfirmation', { email });
  }

  confirmEmail(token: string) {
    return this.http.get(`http://localhost:3000/auth/confirm/${token}`);
  }

  login(email: string, password: string) {
    return this.http.post('http://localhost:3000/auth/login', { email, password},{ withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      });
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

  deleteAccount(email: string) {
    return this.http.delete('http://localhost:3000/auth/delete/' + email);
  }

  deactivateAccount(email: string) {
    return this.http.put('http://localhost:3000/auth/deactivate', { email });
  }

  updateUserInfo(email: string, formData: FormData) {
    return this.http.put(`http://localhost:3000/auth/updateUser/${email}`, formData);
  }

  refreshToken() {
    return this.http.post('http://localhost:3000/auth/refreshToken', {}, { withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      
    });

    
  }
  

  
}
