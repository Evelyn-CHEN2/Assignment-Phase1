import { Component, inject, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { Group } from '../../interface';
import { Channel } from '../../interface';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class Groups {
  groups: Group[] = [];
  showAdd: Record<string, boolean> = {};
  newChannelName: Record<string, string> = {};
  errMsg: string = '';

  private groupService = inject (GroupService)

  ngOnInit(): void {
    forkJoin({
      groups: this.groupService.getGroups(),
      allchannels: this.groupService.getChannels(),
    }).subscribe(({ groups, allchannels }) => {
      this.groups = groups.map(group => {
        return {
          ...group,
          channels: allchannels.filter(channel => channel.groupid === group.id)
        };
      });
      console.log('All groups fetched successfully:', this.groups);
    })
  }

  deleteGroup(group: Group, event: any): void {
    event.preventDefault();
    this.errMsg = '';
    const groupID = group.id;
    this.groupService.deleteGroup(groupID).subscribe({
      next: () => {
        console.log('Group deleted successfully:', group);
        // Remove the deleted group from the groups array, so Angular updates the UI immediately
        this.groups = this.groups.filter(group => group.id !== groupID);
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

  // Delete a channel from a group
  deleteChannel(channel: Channel, event: any): void {
    event.preventDefault();
    this.errMsg = '';
    const channelID = channel.id;
    this.groupService.deleteChannel(channelID).subscribe({
      next: () => {
        console.log('Channel deleted successfully:', channel);
        // Remove the deleted channel from the group's channels, so Angular updates the UI immediately
        const group = this.groups.find(group => group.id === channel.groupid);
        if (group) {
          group.channels = group.channels.filter(channel => channel.id !== channelID);
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
          // Add the new channel to the group's channels so Angular update UI immediately
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
