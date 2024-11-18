import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Chat, Message, User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private socket!: Socket;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();
  
  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  chats$ = this.chatsSubject.asObservable();

  constructor() {
    // Initialize socket connection to the /chat namespace
    this.socket = io(`http://localhost:4000/chat`);

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    }
    );

    this.socket.on('error', (error) => {
      console.error('Error connecting to chat server:', error);
    });
    // Listen for incoming messages
    this.socket.on('new_message', (message) => {
      const currentMessages = this.messagesSubject.value;
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


  }

  // Join a specific chat room by chatId

  joinChat(chatId: string) {
    this.socket.emit('join_chat', chatId);
  }

  // Send a message
  sendMessage(chatId: string, content: string, senderId: string) {

    console.log('Sending message:', content);
    console.log(this.socket);
    this.socket.emit('send_message', chatId, content, senderId);

  }

  // Get the observable for real-time messages
  getMessages(){
    
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
