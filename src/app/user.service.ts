import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  searchUsers(name: string) {
    return this.http.get(`http://localhost:3000/user/search/${name}`);
  }

  constructor(private http: HttpClient) { }

  changeNotifcation(userId: string, notification: boolean) {
    return this.http.post('http://localhost:3000/user/change-notification', { userId, notification });
  }

  getProfilePicture(userId: number) {
    return this.http.get(`http://localhost:3000/user/profile-picture/${userId}`);
  }

  unfriend(userId: number, friendId: number) {
    return this.http.post('http://localhost:3000/user/unfriend', { userId, friendId });
  }

  befriend(userId: number, friendId: number) {
    return this.http.post('http://localhost:3000/user/befriend', { userId, friendId });
  }

  acceptFriend(userId: number, friendRequestId: number) {
    return this.http.post('http://localhost:3000/user/accept-friend-request', { userId, friendRequestId });
  }

  deleteFriendRequest(friendRequestId: number) {
    return this.http.delete(`http://localhost:3000/user/delete-friend-request/${friendRequestId}`);
  }

  suggestFriends(userId: number) {
    return this.http.get(`http://localhost:3000/user/suggested-friends/${userId}`);
  }

  getUser(userId: number) {
    return this.http.get(`http://localhost:3000/user/${userId}`);
  }
}
