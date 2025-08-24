import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel, User } from '../../interface';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { SlicePipe, UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-chatwindow',
  standalone: true,
  imports: [SlicePipe, UpperCasePipe, DatePipe, FormsModule],
  templateUrl: './chatwindow.html',
  styleUrl: './chatwindow.css',
})
export class Chatwindow implements OnInit{
  channel: Channel | null = null;
  currentUser: User | null = null;
  userById: Record<number, string> = {};
  draftMsg: string = '';
  errMsg: string = '';

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const channelID = this.route.snapshot.params['id'];
    if (!channelID) {
      console.error('Channel ID is not provided in the route parameters.');
      return;
    }
    // Fetch the channel by ID
    this.groupService.getChannels().subscribe({
      next: (channels: Channel[]) => {
        this.channel = channels.find(c => c.id === channelID) || null;
        if (!this.channel) {
          console.error(`Channel with ID ${channelID} not found.`);
          return;
        };
      },
      error: (error: any) => {
        console.error('Error fetching channels:', error);
      },
      complete: () => {
        console.log('Channel fetched successfully:', this.channel);
      }
    })
  }

  // Back to the previous page
  goBack(): void {
    this.router.navigate(['/account']);
  }

  // Add a message to the channel
  sendMessage(event: any): void {
    const text = this.draftMsg.trim();
    this.currentUser = this.authService.getCurrentUser();
    const userId = this.currentUser?.id;
    const channelID = this.route.snapshot.params['id'];
    if (!this.draftMsg) {
      this.errMsg = 'Message cannot be empty.';
      return;
    }
    if (!userId) {
      this.errMsg = 'User not found.';
      return;
    }
    this.groupService.addMsgToChannel(channelID, userId, text).pipe(
      switchMap((updatedChannel: Channel) =>
        this.userService.getUsers().pipe(
          map((users: User[]) => {
            const userById = Object.fromEntries(
              users.map(u => [u.id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
            )
            return { updatedChannel, userById }
          })
        )
      )  
    ).subscribe(({ updatedChannel, userById }) => {
      this.channel = updatedChannel;
      this.userById = userById;
      this.draftMsg = ''; 
      this.errMsg = ''; 
    })
  }
}
