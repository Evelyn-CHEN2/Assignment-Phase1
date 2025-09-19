import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel, chatMsg, User } from '../../interface';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { SlicePipe, UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { map } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-chatwindow',
  standalone: true,
  imports: [SlicePipe, UpperCasePipe, DatePipe, FormsModule],
  templateUrl: './chatwindow.html',
  styleUrl: './chatwindow.css',
})
export class Chatwindow implements OnInit, OnDestroy {
  channel: Channel | null = null;
  channelId: string = '';
  currentUser: User | null = null;
  userById: Record<string, string> = {};
  userNum: number = 0;
  message: string = '';
  errMsg: string = '';
  chatMessages: chatMsg[] = []; 

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private router = inject(Router);
  private socketService = inject(SocketService);
  private socket: any; // Define the socket property

  private handleUserNum = ({channelId, userNum} : { channelId: string; userNum: number }) =>{
    if (channelId === this.channelId) {
      this.userNum = userNum;
    }
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) return;
    this.channelId = this.route.snapshot.params['id'];
    if (!this.channelId) {
      console.error('Channel ID is missing in the route parameters.');
      return;
    }
    // Fetch channel and users for displaying channel and user names on the header
    this.groupService.getChannels().pipe(
      map((channels: Channel[]) => {
        return channels.find(c => c._id === this.channelId );
      })
    ).subscribe(channel => {
      this.channel = channel ?? null;
      if (!this.channel) {
        console.error(`Channel ${this.channelId} not found.`);
        return;
      };
      this.userService.getUsers().subscribe((users: User[]) => {
        this.userById = Object.fromEntries(
          users.map(u => [u._id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
        );
        this.errMsg = '';
      })
    });

    // Socket.io integration
    const senderName = this.currentUser.username || 'A new user';
    // Initialize the socket property
    this.socketService.initSocket();
    this.socketService.joinChannel(this.channelId, senderName);
    this.socketService.reqUserNum(this.channelId);
    this.socketService.onMessage((data: any) =>{
      const chatMsg = {
        _id: data._id,
        sender: data.sender,
        message: data.message,
        channelId: this.channelId,
        timestamp: new Date(data.timestamp)
      };
      this.chatMessages.push(chatMsg);
    })

    // Fetch notice and add it as messages 
    this.socketService.onNotices((n: any) => {
      if (!this.channel) return;
      this.chatMessages.push({
        _id: 'system-notice', // Default ID for system notices
        sender: '', // System
        message: n,
        channelId: this.channelId, // Use the current channel ID
        timestamp: new Date()
      })
    })

    // Request real-time current number of users in the channel
    this.socketService.onUserNum(({channelId, userNum}: {channelId: string, userNum: number}) => {
      if (channelId === this.channelId) {
        this.userNum = userNum;
      }
    });
  }

  // Leave the channel when component is destroyed
  ngOnDestroy(): void {
    if (!this.currentUser) return;
    const senderName = this.currentUser.username || 'A new user';
    this.socketService.offUserNum(this.handleUserNum);
    this.socketService.leaveChannel(this.channelId, senderName)
  }

  // Back to the previous page
  goBack(): void {
    this.router.navigate(['/account']);
  }

  // Send a new message
  sendMessage(event: any): void{
    event.preventDefault();
    this.message = '';
    if (!this.message.trim()) {
      this.errMsg = 'Message cannot be empty.';
      return;
    }
    if (!this.currentUser) {
      this.errMsg = 'User not found.';
      return;
    }
    if (!this.channel) {
      this.errMsg = 'Channel not found.';
      return;
    }
    const newMessage = this.message.trim();
    const sender = this.currentUser._id;
    // Emit message via Socket.io
    this.socketService.sendMessage(this.channelId, sender, newMessage);
  }
}
