import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Channel } from '../interface';
import { fromEvent, Observable } from 'rxjs';

// namespace
const SERVER_URL = 'http://localhost:3000/channelChat';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  constructor() { }

  initSocket(): void {
    this.socket = io(SERVER_URL, { transports: ['websocket'] });
  }

  joinChannel(channelId: string): void {
    this.socket?.emit('joinChannel', channelId);
  }

  leaveChannel(channelId: string): void {
    this.socket?.emit('leaveChannel', channelId); // emit sends message to server
  } 

  sendMessage(channelId: string, sender: number, message: string): void {
    this.socket?.emit('message', { channelId, sender, message });
  }

  reqNumUsers(channelId: string): void {
    this.socket?.emit('reqNumUsers', channelId);
  }

  getMessage(next: any): void {
    this.socket?.on('message', next);
  }

}
