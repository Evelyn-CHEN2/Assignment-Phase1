import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel, chatMsg, User } from '../../interface';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { SlicePipe, UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ChatmessageService } from '../../services/chatmessage.service';
import { forkJoin, of, map } from 'rxjs';
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
  loggedUser: User | null = null;
  userById: Record<string, string> = {};
  userNum: number = 0;
  message: string = '';
  errMsg: string = '';
  isAdmin: boolean = false;
  isSuperMap: Record<string, boolean> = {};
  chatMessages: chatMsg[] = []; 
  selectedUser: string = ''; // User id who is selected to ban 
  avatarSrcById: Record<string, string> = {}; // Display user avatar in chat window

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private chatMsgService = inject(ChatmessageService)
  private router = inject(Router);
  private socketService = inject(SocketService);
  private socket: any; // Define the socket property

  private handleUserNum = ({channelId, userNum} : {channelId: string; userNum: number}) =>{
    if (channelId === this.channelId) {
      this.userNum = userNum;
    }
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) return;

    const id = this.route.snapshot.params['id'];
    if (!id) {
      console.error('Channel ID is missing in the route parameters.');
      return;
    }
    this.channelId = id;
    forkJoin({
      channels: this.groupService.getChannels(),
      users: this.userService.getUsers(),
      messages: this.chatMsgService.fetchMsgsByChannelId(this.channelId),
      membership: this.authService.fetchMembership(this.currentUser._id)
    })
    .pipe(
      map(({ channels, users, messages, membership }) => {
        const freshUser = users.find(u => u._id === this.currentUser?._id) ?? this.currentUser;
        this.currentUser = freshUser;

        const channel = channels.find(c => c._id === this.channelId) ?? null;

        const userById = Object.fromEntries(
          users.map(u => [u._id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
        );
        const avatarSrcById = Object.fromEntries(
          users.map(u => [u._id, u.avatar])
        );
        const isSuperMap = Object.fromEntries(
          users.map(u => [u._id, !!u.isSuper])
        );
        const isAdmin = membership?.role === 'admin';

        return { channel, userById, avatarSrcById, isSuperMap, isAdmin, messages };
      })
    ).subscribe({
        next: ({ channel, userById, avatarSrcById, isSuperMap, isAdmin, messages }) => {
          if (!channel) {
            console.error(`Channel ${this.channelId} not found.`);
            this.errMsg = 'Channel not found.';
            return;
          }
          this.channel = channel;
          this.userById = userById;
          this.avatarSrcById = avatarSrcById;
          this.isSuperMap = isSuperMap;
          this.isAdmin = isAdmin;
          this.chatMessages = messages;
          this.errMsg = '';
        },
        error: (err) => {
          console.error('Failed to load chat window data:', err);
          this.errMsg = 'Failed to load chat window.';
        },
        complete: () => {
          console.log('Load chat window successfully.');
          this.errMsg = '';
        }
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
        channelId: this.channelId,
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
    this.errMsg = '';
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
    this.message = '';
  }

  // Toggle ban confirmation modal
  openBanModal(userId: string): void {
    this.selectedUser = userId;
  }
  
  // Ban user and report to super
  confirmBan(userId: string, channelId: string, event: any): void {
    event.preventDefault();
    this.userService.banUser(userId, channelId).subscribe({
      next: () => {
        console.log('User banned successfully.')
      },
      error: (err: any) => {
        console.error('Error banning user:', err);
        this.errMsg = err.error.error || 'Error happened while banning a user.';
      },
      complete: () => { 
        console.log('User ban complete.');
      }   
    });
  } 
}
