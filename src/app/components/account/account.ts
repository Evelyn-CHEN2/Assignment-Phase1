import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../services/auth.service';
import { Group, Channel, User } from '../../interface';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, forkJoin, zipAll } from 'rxjs';
import { map, switchMap, of, tap } from 'rxjs';

@Component({
  selector: 'app-account',
  imports: [FormsModule, CommonModule, NgSelectModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  user: User | null = null;
  viewer: User | null = null;
  userGroups: Group[] = [];
  groupChannels: Channel[] = [];
  channel: Channel | null = null;
  selectedGroup: Group | null = null;
  newRole: Record<string, string> = {}; // For selecting new role in each group
  roleByGroup: Record<string, string> = {}; 
  errMsg: string = '';
  
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  declare bootstrap: any;

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    forkJoin({
      groups: this.groupService.getGroups(),
      channels: this.groupService.getChannels()
    }).pipe(
      map(({ groups, channels }) => {
        // Filter groups with channels that belong to the user
        const filteredGroups = groups.filter(g => this.user?.groups.includes(g._id));
        const filteredChannels = channels.filter(c => filteredGroups.some(g => g._id === c.groupId));
        return { filteredGroups, filteredChannels };
      }),
    ).subscribe({
      next: (data) => {
        if (!data) {
          this.errMsg = 'User not found or access denied';
          return;
        }
        this.userGroups = data.filteredGroups;
        this.groupChannels = data.filteredChannels;
        this.errMsg = '';
      },
      error: (err: any) => {
        console.error('Error fetching user or groups:', err);
        this.errMsg = err.error?.error || 'An error occurred while fetching user or groups.';
      },
      complete: () => {
        console.log('User and groups fetching complete.');
      }
    });
  }


  // Operations for user self
  // Toggle delete confirmation modal
  openDeleteModal(user: User): void {
    this.user = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')!).show();
  }

  // Delete user account, operated by logged user self
  confirmDeleteUser(user: User, event: any): void {
    event.preventDefault();
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.authService.setCurrentUser(null, false); // Clear current user
        this.router.navigate(['/login']);
      }, 
      error: (err: any) => {
        console.error('Error deleting user self:', err);  
        this.errMsg = err.error?.error || 'An error occurred while deleting the user.'
      },
      complete: () => {
        console.log('User self deletion complete.');
      }
    })
  }

  // Toggle to leave group
  openLeaveGroupModal(group: Group): void {
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmLeaveGroupModal')!).show();
  }

  // Leave a group
  confirmLeaveGroup(group: Group, user: User, event: any): void {
    event.preventDefault();
    this.groupService.leaveGroup(group._id, user._id).subscribe({
      next: () => {
        this.userGroups = this.userGroups.filter(g => g._id !== group._id);
      }, 
      error: (err: any) => {
        console.error('Error leaving group:', err);
        this.errMsg = err.error.error || 'An error occurred while leaving the group.'
      },
      complete: () => {
        console.log('Leave group request completed.');
      }
    });
  }

  // Choose the channel to join
  joinChannel(channel: Channel): void {
    this.channel = channel;
    // Navigate to the chat window with the selected channel ID
    this.router.navigate(['/chatwindow', channel._id])
  }
}



