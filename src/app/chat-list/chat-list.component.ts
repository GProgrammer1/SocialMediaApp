import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ChatService } from '../chat.service';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../socket.service';
import { Socket } from 'socket.io-client';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Chat, User } from '../../models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CommonModule, AsyncPipe],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent {
getChatFriendProfilePicture() {
throw new Error('Method not implemented.');
}
  chatList: any;
  selectChat(chat: Chat) {
    this.selectedChat = chat;
  }

  selectedChat: any;
  newMessage: any;
  user: User; 
  message = '' ;
  chats$ : Observable<Chat[]>;

  getChatFriendName(chat: Chat) {
    console.log(chat.participants);
    
    return chat.participants.find((participant => participant.name !== this.user.name))?.name;
    
  }

  
  constructor(private chatService: ChatService, private socketService: SocketService,
    private http: HttpClient
  ) { 
    this.chats$ = this.chatService.chats$; 
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  

  sendMessage() {
    console.log('Sending message:', this.message);
    
    this.chatService.sendMessage('1', this.message, '2');

  }

  getChats() {
    this.chatService.getChats();
  }

}
