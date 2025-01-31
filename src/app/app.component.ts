import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SocketService } from './socket.service';
import { ChatService } from './chat.service';
import { filter } from 'rxjs';
import { User } from '../models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
 
export class AppComponent  {
  
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Mark the user as online when the tab is opened
    const user = sessionStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      this.chatService.updateUserState(userObj._id, true);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
onBeforeUnload(event: Event) {
  this.setUserOffline();
}

@HostListener('document:visibilitychange')
onVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    this.setUserOffline();
  } else if (document.visibilityState === 'visible') {
    this.setUserOnline();
  }
}

private setUserOnline() {
  const user = sessionStorage.getItem('user');
  if (user) {
    const userObj = JSON.parse(user);
    this.chatService.updateUserState(userObj._id, true);
  }
}

private setUserOffline() {
  const user = sessionStorage.getItem('user');
  if (user) {
    const userObj = JSON.parse(user);
    this.chatService.updateUserState(userObj._id, false);
  }
}

}
