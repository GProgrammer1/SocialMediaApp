import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  deleteUser(userId: number) {
   return this.http.delete(`http://localhost:3000/user/delete/${userId}`);
  }
  getAllUsers() {
    return this.http.get('http://localhost:3000/user/all');
  }

  constructor(private http: HttpClient) { }
}
