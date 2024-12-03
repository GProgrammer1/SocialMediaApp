import { Injectable } from '@angular/core';
import { Notification } from '../models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  markAsRead(notifications: Notification[]) {
    return this.http.post<Notification[]>('http://localhost:3000/notification/mark-read', {notifications});
  }

  getNotifications(userId: number) {
    return this.http.get<Notification[]>(`http://localhost:3000/notification/${userId}`);
  }

}
