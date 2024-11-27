import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CommonModule, AsyncPipe, MatIconModule, MatButtonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css',
  encapsulation: ViewEncapsulation.Emulated
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

  isUserOnline(userId: number): boolean {
    // Use onlineUsers$ to check if the user is online
    let isOnline = false;
    this.onlineUsers$.subscribe((users) => {
      isOnline = users.some((user) => user._id === userId);
    }).unsubscribe(); // Unsubscribe immediately since this is synchronous
    return isOnline;
  }

  ngOnInit(): void {
      this.getChats();
      this.chatService.getOnlineUsers();

    // Subscribe to onlineUsers$ for debugging or state management if needed
    this.onlineUsersSubscription = this.onlineUsers$.subscribe((users) => {
      console.log('Online users:', users);
    });
  }


getChatFriendProfilePicture() {
}
  chatList: any;
  selectChat(chat: Chat) {
    this.setSelectedChat(chat);
    this.chatService.joinChat(chat._id!);
    this.chatService.getMessages(chat._id!);
    this.read = true;
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
  newMessage: any;
  messages$ : Observable<Message[]> ;
  user: User;
  read: boolean = false;
  message = '' ;
  chats$ : Observable<Chat[]>;
  showScrollToBottom = false;

  getChatFriendName(chat: Chat) {
    console.log(chat.participants);

    return chat.participants.find((participant => participant.name !== this.user.name))?.name;

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




  constructor(private chatService: ChatService, private socketService: SocketService,
    private http: HttpClient
  ) {
    this.chats$ = this.chatService.chats$;
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.messages$ = this.chatService.messages$;

    this.onlineUsers$ = this.chatService.onlineUsers$;



  }

  @ViewChild('chatWindow') chatWindow!: ElementRef ;

  fetchOnlineUsers(chat: Chat) {
    this.chatService.getOnlineUsers() ;
  }
  sendMessage() {
    console.log('Sending message:', this.message);

    this.chatService.sendMessage(this.selectedChat!._id!, this.message, this.user._id!);
    setTimeout(() => {console.log(this.selectedChat);
     ;
    },1000
  );
  this.message = ''


  }

  getChats() {
    this.chatService.getChats();
  }

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


}
