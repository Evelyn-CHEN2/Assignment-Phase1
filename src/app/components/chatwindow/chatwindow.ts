import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel, User } from '../../interface';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { SlicePipe, UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { map, switchMap } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-chatwindow',
  standalone: true,
  imports: [SlicePipe, UpperCasePipe, DatePipe, FormsModule],
  templateUrl: './chatwindow.html',
  styleUrl: './chatwindow.css',
})
export class Chatwindow implements OnInit{
  channel: Channel | null = null;
  channelId: string = '';
  currentUser: User | null = null;
  userById: Record<number, string> = {};
  message: string = '';
  errMsg: string = '';

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private router = inject(Router);
  private socketService = inject(SocketService);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.channelId = this.route.snapshot.params['id'];
    if (!this.channelId) {
      console.error('Channel ID is missing in the route parameters.');
      return;
    }
    // Fetch channel and users for displaying names
    this.groupService.getChannels().pipe(
      map((channels: Channel[]) => {
        return channels.find(c => c.id === this.channelId );
      })
    ).subscribe(channel => {
      this.channel = channel ?? null;
      console.log('Loaded channel:', channel);
      if (!this.channel) {
        console.error(`Channel ${this.channelId} not found.`);
        return;
      };
      this.userService.getUsers().subscribe((users: User[]) => {
        this.userById = Object.fromEntries(
          users.map(u => [u.id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
        )
      })
    });

    // Socket.io integration
    this.socketService.initSocket();
    this.socketService.joinChannel(this.channelId);
    this.socketService.getMessage((m: any) =>{
      const message = {
        sender: m.sender,
        message: m.message,
        timestamp: new Date(m.timestamp)
      };
      console.log('Received message:', message);
      (this.channel as Channel).messages.push(message);
    })
  }

  // Back to the previous page
  goBack(): void {
    this.router.navigate(['/account']);
  }

  // Send a new message
  sendMessage(event: any): void{
    event.preventDefault();
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
    console.log('Sending message:', this.message);
    const newMessage = this.message.trim();
    const sender = this.currentUser.id;
    // Emit message via Socket.io
    this.socketService.sendMessage(this.channelId, sender, newMessage);
    this.message = '';
  }
}
