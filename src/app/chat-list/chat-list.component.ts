import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ChatService } from '../chat.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../socket.service';
import { Socket } from 'socket.io-client';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Chat, Message, User } from '../../models';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from '../chat/chat.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [ FormsModule, CommonModule, AsyncPipe, MatIconModule, MatButtonModule, ChatComponent, NavbarComponent,
    MatDialogModule, ReactiveFormsModule
  ],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class ChatListComponent implements OnDestroy, OnInit {
  private onlineStatusSubjects: { [chatId: string]: BehaviorSubject<boolean> } = {};

  emailForm! : FormGroup;
  onlineUsers$!: Observable<User[]>;
  onlineUsersSubscription!: Subscription;

  chatList: any;
  selectedChat: Chat | null = null;
  messages$: Observable<Message[]>;
  user: User;
  chats$: Observable<Chat[]>;

  message: string = '';
  read: boolean = false;
  showScrollToBottom: boolean = false;

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  constructor(private chatService: ChatService, private socketService: SocketService, private http: HttpClient, private fb: FormBuilder,
    private dialog:  MatDialog
  ) {
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.onlineUsers$ = this.chatService.onlineUsers$;
    this.chats$ = this.chatService.chats$;
    this.messages$ = this.chatService.messages$;

    this.emailForm = this.fb.group({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email]
      })
    });

  }

  ngOnInit(): void {
    this.getChats();
    this.chatService.getOnlineUsers();

    // Subscribe to onlineUsers$ for state management or debugging
    this.onlineUsersSubscription = this.onlineUsers$.subscribe((users) => {
      this.isUserOnline = (userId: number) => users.some((user) => user._id === userId);
      console.log('Online users:', users);
    });
  }

  ngOnDestroy(): void {
    console.log('Destroying chat component');
    this.setSelectedChat(null);

    // Clear all intervals
    for (const chatId in this.onlineStatusSubjects) {
      this.onlineStatusSubjects[chatId].complete();
    }

    // Unsubscribe from onlineUsers$
    if (this.onlineUsersSubscription) {
      this.onlineUsersSubscription.unsubscribe();
    }
  }

  isUserOnline!: (userId: number) => boolean;

  getChats() {
    this.chatService.getChats();
  }

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
    } else {
      this.selectedChat = null;
      this.chatService.selectedChatSubject.next(false);
    }
  }

  sendMessage() {
    console.log('Sending message:', this.message);
    if (this.selectedChat) {
      this.chatService.sendMessage(this.selectedChat._id!, this.message, this.user._id!);
      setTimeout(() => {
        console.log(this.selectedChat);
      }, 1000);
    }
    this.message = '';
  }

  getChatFriendName(chat: Chat) {
    console.log(chat.participants);
    return chat.participants.find((participant) => participant.name !== this.user.name)?.name;
  }

  openEmailDialog() {
    const dialogRef = this.dialog.open(EmailDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((email: string) => {
      if (email) {
        console.log('Received email:', email);
        // Handle the email data here (send it to server, update the UI, etc.)
      }
    });
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

  getChatFriendProfilePicture(chat: Chat) {
    return chat.participants.find((participant: User) => participant.name !== this.user.name)?.profilePic;
  }
}




  @Component({
    selector: 'app-create-chat',
    template: `
      <h2 mat-dialog-title>Enter the Email</h2>
      <form [formGroup]="emailForm" (ngSubmit)="onSubmit()">
        <mat-form-field>
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required />
          <mat-error *ngIf="emailForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="emailForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
        </mat-form-field>
        <div mat-dialog-actions>
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="emailForm.invalid">Submit</button>
        </div>
      </form>
    `,
    imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, CommonModule, MatInputModule],
    standalone: true
  })
  export class EmailDialogComponent {
    emailForm: FormGroup;

    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<EmailDialogComponent>,
      private chatService: ChatService

    ) {
      this.emailForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      });
    }

    onSubmit(): void {
      if (this.emailForm.valid) {
        this.dialogRef.close(this.emailForm.value.email);
         // Send email back to parent
         this.chatService.createChat(this.emailForm.value.email).subscribe((chat) => {
          console.log('Chat created:', chat);
          this.chatService.getChats();
         });

      }
      else {
        console.log('Invalid email');
        return ;
      }
    }

    onCancel(): void {
      this.dialogRef.close();
    }
  }

function formatTime(dateString: any, Date: DateConstructor) {
  throw new Error('Function not implemented.');
}

