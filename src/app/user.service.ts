import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  changeNotifcation(userId: string, notification: boolean) {
    return this.http.post('http://localhost:3000/user/change-notification', { userId, notification });
  }

  getProfilePicture(userId: number) {
    return this.http.get(`http://localhost:3000/user/profile-picture/${userId}`);
  }
}
