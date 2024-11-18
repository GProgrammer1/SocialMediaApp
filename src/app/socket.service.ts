// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  constructor() {
  }

  connect(): void {
    console.log(this.socket);
    
    if (!this.socket) {
      this.socket = io("http://localhost:4000");  // Ensure you have `socketUrl` in your environment settings
      console.log('Connected to WebSocket server');

      // Example event listener
      this.socket.on('message', (data: any) => {
        console.log('Response from server:', data);
      });
    }

    this.socket.on('connect_error', (error) => {
      console.error('Error connecting to WebSocket server:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Disconnected from WebSocket server');
      this.socket = null;
    }
  }

  sendMessage(message: string): void {
    console.log(this.socket);
    
    if (this.socket) {
      this.socket.emit('message', message);
    }
  }

  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket?.on('message', (message) => {
        observer.next(message);
        
      });
    });
  }

}
