import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, interval, Observable, startWith, switchMap } from 'rxjs';
import { Chat, Message, User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private socket!: Socket;
  private periodicCheck$ = interval(4000000);

  onlineUsersSubject = new BehaviorSubject<User[]>([]);
  onlineUsers$ = this.onlineUsersSubject.asObservable();

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  chats$ = this.chatsSubject.asObservable();

  selectedChatSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    // Initialize socket connection to the /chat namespace
    this.socket = io('http://localhost:4000/chat');

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('error', (error) => {
      console.error('Error connecting to chat server:', error);
    });

    this.socket.on('get-online-users', (users) => {
      console.log(users);
      this.onlineUsersSubject.next(users);
    });

    this.socket.on('new_message', (message) => {
      const currentMessages = this.messagesSubject.value;
      if (this.selectedChatSubject.value === true) {
        this.updateMessagesState(message.chat, JSON.parse(sessionStorage.getItem('user') || '{}')._id, 'seen');
      }
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.socket.on('new_chat', (chat) => {
      const currentChats = this.chatsSubject.value;
      this.chatsSubject.next([...currentChats, chat]);
    });

    this.socket.on('get-chats', (chats) => {
      console.log(chats);
      this.chatsSubject.next(chats);
    });

    this.socket.on('get-messages', (messages) => {
      console.log(messages);
      this.messagesSubject.next(messages);
    });

    this.socket.on('update-messages-state', (messages) => {
      console.log(messages);
      this.messagesSubject.next(messages);
    });

    this.setupPeriodicOnlineUsersCheck();
  }

  ngOnDestroy(): void {
    // Clean up socket connection to avoid memory leaks
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getOnlineUsers() {
    this.socket.emit('get-online-users');
  }

  updateMessagesState(chatId: number, userId: number, state: string) {
    console.log('Updating messages state:', chatId, userId, state);
    this.socket.emit('update-messages-state', chatId, userId, state);
  }

  joinChat(chatId: number) {
    this.socket.emit('join_chat', chatId);
  }

  setupPeriodicOnlineUsersCheck() {
    this.periodicCheck$
      .pipe(
        startWith(0), // Immediately trigger the first emission
        switchMap(() => {
          this.getOnlineUsers();
          return this.onlineUsers$; // Continue listening for updates
        })
      )
      .subscribe((users) => {
        console.log('Periodic users update:', users);

        const chats = this.chatsSubject.value;
        users.forEach((user) => {
          const chatId = chats.find((chat) =>
            chat.participants.some((participant) => participant._id === user._id)
          )?._id;

          if (chatId) {
            this.updateMessagesState(chatId, user._id!, 'delivered');
          }
        });
      });
  }

  updateUserState(userId: number, isOnline: boolean) {
    this.socket.emit('update-user-state', userId, isOnline);
  }

  sendMessage(chatId: number, content: string, senderId: number) {
    console.log('Sending message:', content);
    this.socket.emit('send_message', chatId, content, senderId);
  }

  getMessages(chatId: number) {
    this.socket.emit('get-messages', chatId);
  }

  getChats() {
    const user: User = JSON.parse(sessionStorage.getItem('user') || '{}');
    console.log('User: ', user);
    this.socket.emit('get-chats', user._id);
  }

  // Disconnect from the chat
  disconnect() {
    this.socket.disconnect();
  }
}
