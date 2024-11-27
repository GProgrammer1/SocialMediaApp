
import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { ChatService } from '../chat.service';
import { Observable } from 'rxjs';
import { Chat, Message, User } from '../../models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CommonModule, AsyncPipe, MatIconModule, MatButtonModule],

  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  showScrollToBottom = false;
  message = '' ;
  read: boolean = false;
  messages$: Observable<Message[]> ; 
  @Input() selectedChat: Chat | null = null;
  newMessage: any;
  user: User; 


  scrollToBottom(animate: boolean = false): void {
    const chatWindowElement = this.chatWindow.nativeElement;
    chatWindowElement.scrollTo({
      top: chatWindowElement.scrollHeight,
      behavior: animate ? 'smooth' : 'auto'
    });
  }

  onScroll(): void {
    const chatWindowElement = this.chatWindow.nativeElement;
    const isAtBottom =
      chatWindowElement.scrollTop >=
      chatWindowElement.scrollHeight - chatWindowElement.offsetHeight - 10;
    const isAboveThreshold =
      chatWindowElement.scrollTop < chatWindowElement.scrollHeight - 200;

    this.showScrollToBottom = !isAtBottom && isAboveThreshold;
  }
  @ViewChild('chatWindow') chatWindow!: ElementRef ;


  sendMessage() {
    console.log('Sending message:', this.message);
    
    this.chatService.sendMessage(this.selectedChat!._id!, this.message, this.user._id!);
    setTimeout(() => {console.log(this.selectedChat);
     ;
    },1000
  );
  this.message = '' 
    
  }

  constructor(private chatService: ChatService) {
    console.log(this.selectedChat);
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.messages$ = this.chatService.messages$;
  }

  formatTime(dateString: Date) {
    const date = new Date(dateString);
  
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Ensures two digits for minutes
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle case where hours is 0
  
    return `${hours}:${minutes} ${ampm}`;
  }

  getChatFriendName(chat: Chat) {
    console.log(chat.participants);
    
    return chat.participants.find((participant => participant.name !== this.user.name))?.name;
    
  }

}
