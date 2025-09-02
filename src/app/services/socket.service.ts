import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

// namespace
const SERVER_URL = 'http://localhost:3000/channelChat';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  constructor() { }

  initSocket(): void {
    this.socket = io(SERVER_URL);
  }

  joinChannel(channelId: string, senderName: string): void {
    this.socket?.emit('joinChannel', {channelId, senderName});
  }

  leaveChannel(channelId: string, senderName: string): void {
    this.socket?.emit('leaveChannel', {channelId, senderName}); // emit sends message to server
  } 

  sendMessage(channelId: string, sender: number, message: string): void {
    this.socket?.emit('chatMsg', { channelId, sender, message });
  }

  onMessage(handler: (payload: {channelId: string, sender: number, message: string, timestamp: Date}) => void): void {
    this.socket?.on('chatMsg', handler); // Handler holds payload sent back from server
  }

  reqUserNum(channelId: string): void {
    this.socket?.emit('reqUserNum', channelId);
  }

  onUserNum(handler: (payload:{channelId: string, userNum: number}) => void): void {
    this.socket?.on('userNum', handler);
  }

  offUserNum(handler: (payload:{channelId: string, userNum: number}) => void): void {
    this.socket?.off('userNum', handler);
  }

  onNotices(handler: any): void {
    this.socket?.on('notice', handler);
  }
}
