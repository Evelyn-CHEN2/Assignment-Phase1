import { Component, inject, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { Group, User } from '../../interface';
import { Channel } from '../../interface';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class Groups {
  groups: Group[] = [];
  userById: Record<number, string> = {};
  showAdd: Record<string, boolean> = {};
  newChannelName: Record<string, string> = {};
  selectedGroup: Group | null = null;
  selectedChannel: Channel | null = null;
  errMsg: string = '';

  private groupService = inject (GroupService)
  private userService = inject(UserService);
  declare bootstrap: any;

  ngOnInit(): void {
    forkJoin({
      groups: this.groupService.getGroups(),
      allchannels: this.groupService.getChannels(),
      allusers: this.userService.getUsers()
    }).subscribe(({ groups, allchannels, allusers }) => {
      // this.usersById = Object.fromEntries(
      //   allusers.map(u => [u.id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
      // )
      this.userById = allusers.reduce((acc, user) => {
        acc[user.id] = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        return acc;
      }, {} as Record<number, string>);

      this.groups = groups.map(group => {
        return {
          ...group,
          channels: allchannels.filter(c => c.groupid === group.id),
        };

      });
      console.log('All groups fetched successfully:', this.groups);
    })
  }

  // Toggle delete confirmation modal
  openDeleteGroupModal(group: Group): void {
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')!).show();
  }

  // Delete a group
  deleteGroup(group: Group, event: any): void {
    event.preventDefault();
    this.errMsg = '';
    const groupID = group.id;
    this.groupService.deleteGroup(groupID).subscribe({
      next: (groups: Group[]) => {
        console.log('Group deleted successfully:', group);
        // Remove the deleted group from the groups array
        this.groups = groups;
        console.log('Remaining groups:', this.groups);
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
}
