import { Component, inject, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { NotificationService } from '../../services/notification.service';
import { Group, User, Notification } from '../../interface';
import { Channel } from '../../interface';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class Groups implements OnInit {
  groups: Group[] = [];
  userById: Record<number, string> = {};
  user: User | null = null;
  showAdd: Record<string, boolean> = {};
  newChannelName: Record<string, string> = {};
  selectedGroup: Group | null = null;
  selectedChannel: Channel | null = null;
  errMsg: string = '';
  applyPending: Record<string, boolean> = {};

  private groupService = inject (GroupService)
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  declare bootstrap: any;

  ngOnInit(): void {
    // Retrive user data from localStorage
    const currentUser = this.authService.getCurrentUser();
    this.user = currentUser;
    console.log('Current user:', this.user);
    // Fetch all groups, channels, and users in parallel
    forkJoin({
      groups: this.groupService.getGroups(),
      allchannels: this.groupService.getChannels(),
      allusers: this.userService.getUsers()
    }).pipe(
      map(({ groups, allchannels, allusers }) => {
        // Refresh user data (so on .html user?.groups.includes(group.id) can work after user joins a new group)
        const freshUser = allusers.find(u => u.id === currentUser?.id) ?? currentUser;
        this.user = freshUser;

        const userById = Object.fromEntries(
          allusers.map(u => [u.id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
        );
        const formattedGroups = groups.map(group => {
          return {
            ...group,
            channels: allchannels.filter(c => c.groupid === group.id),
          }
        });

        // restore pending state per group (optional but handy)
        for (const g of formattedGroups) {
          const k = g.id;
          this.applyPending[k] = JSON.parse(localStorage.getItem('applyPending_' + k) || 'false');
}



        return { userById, formattedGroups };
      }),
    ).subscribe(({ userById, formattedGroups }) => {
      this.userById = userById;
      this.groups = formattedGroups;
      console.log('All groups fetched successfully:', this.groups);
    });
  }




  // Actions for super and admin
  // Edit a group
  editGroup(group: Group, event: any): void {

  }

  // Toggle delete confirmation modal
  openDeleteGroupModal(group: Group): void {
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteGroupModal')!).show();
  }

  // Delete a group
  deleteGroup(group: Group, event: any): void {
    event.preventDefault();
    this.errMsg = '';
    const groupID = group.id;
    this.groupService.deleteGroup(groupID).subscribe({
      next: () => {
        console.log('Group deleted successfully:', group);
        // Remove the deleted group from the groups array for UI display immediately
        this.groups = this.groups.filter(g => g.id !== groupID);
      },
      error: (error: any) => {
        console.error('Error deleting group:', error);
        this.errMsg = error.error.error || 'Failed to delete group.';
      },
      complete: () => {
        console.log('Group deletion request completed.');
      }
    })
  }

  // Toggle channel deletion confirmation modal
  openDeleteChannelModal(channel: Channel): void {
    this.selectedChannel = channel;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteChannelModal')!).show();
  }

  // Delete a channel from a group
  deleteChannel(channel: Channel, event: any): void {
    this.errMsg = '';
    const channelID = channel.id;
    this.groupService.deleteChannel(channelID).subscribe({
      next: () => {
        console.log('Channel deleted successfully:', channel);
        // Remove the deleted channel from the group's channels
        const group = this.groups.find(g => g.id === channel.groupid);
        if (group) {
          group.channels = group.channels.filter(c => c.id !== channelID);
        } else {
          console.warn('Group not found for channel deletion:', channel.groupid);
        }
      },
      error: (error: any) => {
        console.error('Error deleting channel:', error);
        this.errMsg = error.error.error || 'Failed to delete channel.';
      },
      complete: () => {
        console.log('Channel deletion request completed.');
      }
    })
  }

  //Add a new channel to a group
  toggleAddChannel(group: Group): void {
    this.showAdd[group.id] = !this.showAdd[group.id];
  }

  confirmAddChannel(group: Group, event: any): void {
    event.preventDefault();
    this.errMsg = '';
    const channelName = this.newChannelName[group.id];
    if (channelName === '') {
      this.errMsg = 'Channel name is required.';
      return;
    }
    this.groupService.createChannel(group, channelName).subscribe({
      next: (newChannel: Channel) => {
        if (newChannel) {
          console.log('Channel created successfully:', newChannel);
          // Add the new channel to the group's channels
          group.channels.push(newChannel);
          // Reset channel name input
          this.newChannelName[group.id] = '';
        }
      },
      error: (error: any) => {
        console.error('Error creating channel:', error);
        this.errMsg = error.error.error || 'Failed to create channel.';
      },
      complete: () => {
        console.log('Channel creation request completed.');
      }
    })
  }

  // Actions for chatusers
  // Apply to join a group
  applyToJoinGroup(group: Group, event: any): void {
    event.preventDefault();
    const groupId = group.id;
    const groupCreatorId = group.createdBy;
    this.applyPending[groupId] = false; 
    
    if (this.user?.groups.includes(groupId)) {
      alert('You are already a member of this group.');
      return;
    }
    
    if (this.user?.id === undefined) {
      this.errMsg = 'User ID is required to send a notification.';
      return;
    }

    if (groupCreatorId === undefined) {
      this.errMsg = 'Group creator ID is undefined.';
      return;
    }

    this.notificationService.createNotification(this.user.id, groupId, groupCreatorId).subscribe({
      next: (newNotification: Notification) => {
        alert('Application sent. Please wait for admin approval.');
        this.applyPending[groupId] = true;
        localStorage.setItem('applyPending_' + groupId, JSON.stringify(this.applyPending[groupId]));
      },
      error: (error: any) => {
        console.error('Error sending application:', error);
        this.errMsg = error.error.error || 'Failed to send application.';
      },
      complete: () => {
        console.log('Application request completed.');  
      }
    })
  }





}
 