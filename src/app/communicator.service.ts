import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, Post, Story, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CommunicatorService {

  bioSubject = new BehaviorSubject<string>('');
  bio$ = this.bioSubject.asObservable();
  profilePictureSubject = new BehaviorSubject<string>('');
  profilePicture$ = this.profilePictureSubject.asObservable();
  postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();
  friendsSubject = new BehaviorSubject<User[]>([]);
  friends$  = this.friendsSubject.asObservable();
  searchResultsSubject = new BehaviorSubject<User[]>([]);
  searchResults$ = this.searchResultsSubject.asObservable();
  suggestedFriendsSubject = new BehaviorSubject<User[]>([]);
  suggestedFriends$ = this.suggestedFriendsSubject.asObservable();
  notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  storySubject = new BehaviorSubject<Story[] | null>(null);
  stories$ = this.storySubject.asObservable();
  constructor() { }
}
