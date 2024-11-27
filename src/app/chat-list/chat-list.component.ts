import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ChatService } from '../chat.service';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../socket.service';
import { Socket } from 'socket.io-client';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject, interval, Observable, Subscription, switchMap } from 'rxjs';
import { Chat, Message, User } from '../../models';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [ FormsModule, CommonModule, AsyncPipe, MatIconModule, MatButtonModule, ChatComponent],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent implements OnDestroy, OnInit{
  private onlineStatusSubjects: { [chatId: string]: BehaviorSubject<boolean> } = {};
  onlineUsers$!: Observable<User[]>; 
  intervalId: number = 0;
  onlineUsersSubscription!: Subscription ;
  
  ngOnDestroy(): void {
    console.log('Destroying chat component');
    this.setSelectedChat(null);

    // Clear all intervals
    for (const chatId in this.onlineStatusSubjects) {
      this.onlineStatusSubjects[chatId].complete();
    }
  }

  isUserOnline!: (userId: number) => boolean;

  ngOnInit(): void {
      this.getChats();
      this.chatService.getOnlineUsers();

    // Subscribe to onlineUsers$ for debugging or state management if needed
    this.onlineUsersSubscription = this.onlineUsers$.subscribe((users) => {
      this.isUserOnline = (userId: number) =>  users.some((user) => user._id === userId);
    });

   
  }


getChatFriendProfilePicture() {
}

  chatList: any;
  
  selectChat(chat: Chat) {
    this.setSelectedChat(chat);
    this.chatService.joinChat(chat._id!);
    this.chatService.getMessages(chat._id!);
    this.chatService.updateMessagesState(chat._id!, this.user._id!, 'seen');
    this.chatService.selectedChatSubject.next(true);
  }

  setSelectedChat(chat: Chat | null) {
    if (chat) {
      this.selectedChat = chat;
      this.chatService.selectedChatSubject.next(true);
    }
    else {
      this.selectedChat = null;
      this.chatService.selectedChatSubject.next(false);
    }
  }

  selectedChat!: Chat | null;
 
  
  user: User; 
  
  
  chats$ : Observable<Chat[]>;
  


  
   
    

  
  constructor(private chatService: ChatService, private socketService: SocketService,
    private http: HttpClient
  ) { 
    this.chats$ = this.chatService.chats$; 
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');

    this.onlineUsers$ = this.chatService.onlineUsers$;
  }

 
  
  fetchOnlineUsers(chat: Chat) {
    this.chatService.getOnlineUsers() ;
  }

 

  getChats() {
    this.chatService.getChats();
  }

  getChatFriendName(chat: Chat) {
    console.log(chat.participants);
    
    return chat.participants.find((participant => participant.name !== this.user.name))?.name;
    
  }

  

}
