import { Component, inject, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { NotificationService } from '../../services/notification.service';
import { Group, Membership, User } from '../../interface';
import { Channel } from '../../interface';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';
import { SlicePipe } from '@angular/common';

// Reformatted groups with channels, not channel IDs
type GroupReformatted = Omit<Group, 'channels'> & { channels: Channel[] }; 

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, NgClass, SlicePipe],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class Groups implements OnInit {
  groups: GroupReformatted[] = [];  
  adminGroups: GroupReformatted[] = [];
  formattedGroups: GroupReformatted[] = []; 
  userById: Record<string, string> = {};
  user: User | null = null;
  userRole: string = '';  
  membership: Membership | null = null;
  adminGroupsActive: boolean = false;
  showAdd: Record<string, boolean> = {};
  showEdit: Record<string, boolean> = {};
  newGroupName: Record<string, string> = {};
  newChannelName: Record<string, string> = {};
  selectedGroup: GroupReformatted | null = null;
  selectedChannel: Channel | null = null;
  errMsg: string = '';
  applyPending: Record<string, boolean> = {};
  groupsToDisplay = 2; // Number of groups to display initially
  sortAsc: boolean = true; // Sort groups order state

  private groupService = inject (GroupService)
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  declare bootstrap: any;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    // Fetch all groups, channels, and users in parallel
    forkJoin({
      groups: this.groupService.getGroups(),
      allchannels: this.groupService.getChannels(),
      allusers: this.userService.getUsers(),
      membership: this.authService.fetchMembership(currentUser?._id || ''),
    }).pipe(
      map(({ groups, allchannels, allusers, membership }) => {
        // Refresh user data (so user?.groups.includes(group.id) can work after user joins a new group)
        const freshUser = allusers.find(u => u._id === currentUser?._id) ?? currentUser;
        this.user = freshUser;
        const userById = Object.fromEntries(
          allusers.map(u => [u._id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
        );
        // Fetch all groups with their channels
        const formattedGroups = groups.map(g => {
          return {
            ...g,
            channels: allchannels.filter(c => c.groupId === g._id)
          }
        });
        this.userRole = membership?.role || 'chatuser';
        // Groups administered by current user
        const adminGroups = freshUser ? formattedGroups.filter(g => membership?.groups?.includes(g._id)) : [];
        return { userById, formattedGroups, adminGroups, membership };
      }),
    ).subscribe(({ userById, formattedGroups, adminGroups, membership }) => {
      this.userById = userById;
      this.groups = formattedGroups;
      this.adminGroups = adminGroups;
      // Keep a copy for button 'admin groups' to switch back to all groups
      this.formattedGroups = formattedGroups; 
      this.membership = membership;
      this.errMsg = ''
    });
  }

  // Sort groups by names
  sortGroups(): void{
    this.errMsg = '';
    this.groups.sort((a,b) => a.groupname.localeCompare(b.groupname));
    if (!this.sortAsc) {
      this.groups.reverse();
    }
    this.sortAsc = !this.sortAsc;
  }

  // <-- Actions for super and admin -->
  // Switch to disable buttons to show groups/adminGroups
  showAdminGroups(): void {
    this.errMsg = '';
    this.adminGroupsActive = true;
    this.groups = this.adminGroups; // Refresh page to display admin groups
  }
  showAllGroups(): void {
    this.errMsg = '';
    this.adminGroupsActive = false;
    this.groups = this.formattedGroups; // Refresh page to display all groups
  }

  // Toggle edit group form
  toggleEditGroup(group: GroupReformatted): void {
    this.errMsg = '';
    this.showEdit[group._id] = !this.showEdit[group._id];
  }

  // Edit a group
  editGroup(group: GroupReformatted, event: any): void {
    event.preventDefault();
    this.errMsg = '';
    const groupId = group._id;
    const newGroupName = this.newGroupName[group._id];
    this.groupService.editGroup(groupId, newGroupName).subscribe({
      next: () => {
        // Update group name for UI display immediately
        group.groupname = newGroupName;
        this.showEdit[group._id] = false;
      },
      error: (error: any) => {
        console.error('Error editing group:', error);
        this.errMsg = error.error.error || 'Failed to edit group.';
      },
      complete: () => {
        console.log('Group edit request completed.');
      }
    })
  }

  // Toggle delete confirmation modal
  openDeleteGroupModal(group: GroupReformatted): void {
    this.errMsg = '';
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteGroupModal')!).show();
  }

  // Delete a group
  deleteGroup(group: GroupReformatted, event: any): void {
    event.preventDefault();
    const groupId = group._id;
    this.groupService.deleteGroup(groupId).subscribe({
      next: () => {
        // Remove the deleted group from the groups array for UI display immediately
        this.groups = this.groups.filter(g => g._id !== groupId); // For super
        this.adminGroups = this.adminGroups.filter(g => g._id !== groupId) // For admin
      },
      error: (err: any) => {
        console.error('Error deleting group:', err);
        this.errMsg = err.error.error || 'Failed to delete group.';
      },
      complete: () => {
        console.log('Group deletion request completed.');
      }
    })
  }

  // Toggle channel deletion confirmation modal
  openDeleteChannelModal(channel: Channel): void {
    this.errMsg = '';
    this.selectedChannel = channel;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteChannelModal')!).show();
  }

  // Delete a channel from a group
  deleteChannel(channel: Channel, event: any): void {
    event.preventDefault();
    const channelId = channel._id;
    this.groupService.deleteChannel(channelId).subscribe({
      next: () => {
        // Remove the deleted channel from the group's channels
        const group = this.groups.find(g => g._id === channel.groupId);
        if (group) {
          group.channels = group.channels.filter(c => c._id !== channelId);
        } else {
          console.warn('Group not found for channel deletion:', channel.groupId);
        }
      },
      error: (err: any) => {
        console.error('Error deleting channel:', err);
        this.errMsg = err.error.error || 'Failed to delete channel.';
      },
      complete: () => {
        console.log('Channel deletion request completed.');
      }
    })
  }

  //Add a new channel to a group
  toggleAddChannel(group: GroupReformatted): void {
    this.errMsg = '';
    this.newChannelName[group._id] = '';
    this.showAdd[group._id] = !this.showAdd[group._id];
  }

  confirmAddChannel(group: GroupReformatted, event: any): void {
    event.preventDefault();
    const channelName = this.newChannelName[group._id];
    if (channelName === '') {
      this.errMsg = 'Channel name is required.';
      return;
    }
    this.groupService.createChannel(group._id, channelName).subscribe({
      next: (newChannel: Channel) => {
          // Add the new channel to the group's channels
          group.channels.push(newChannel);
          // Reset channel name input
          this.newChannelName[group._id] = '';
      },
      error: (err: any) => {
        console.error('Error creating channel:', err);
        this.errMsg = err.error.error || 'Failed to create channel.';
      },
      complete: () => {
        console.log('Channel creation request completed.');
      }
    })
  }

  // <-- Actions for chatusers -->
  // Apply to join a group
  applyToJoinGroup(group: GroupReformatted, event: any): void {
    this.errMsg = '';
    event.preventDefault();
    const groupId = group._id;
    if (this.user?._id === undefined) {
      this.errMsg = 'User ID is required to send a notification.';
      return;
    }

    this.notificationService.createNotification(this.user._id, groupId).subscribe({
      next: () => {
        alert('Application sent. Please wait for admin approval.');
        this.applyPending[groupId] = true;
      },
      error: (err: any) => {
        console.error('Error sending application:', err);
        this.errMsg = err.error.error || 'Failed to send application.';
      },
      complete: () => {
        console.log('Application request completed.');  
      }
    })
  }

  // Load more groups when "More" button is clicked
  loadMoreGroups(): void {
    this.groupsToDisplay += 2;
  }

  // Load less groups when "Less" button is clicked
  resetGroupsDisplay(): void {
    this.groupsToDisplay = 2;
  }
}
 