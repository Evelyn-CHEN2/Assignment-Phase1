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

// Reformatted groups with channels, not channel IDs
type GroupReformatted = Omit<Group, 'channels'> & { channels: Channel[] }; 

@Component({
  selector: 'app-account',
  imports: [FormsModule, CommonModule, NgSelectModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  user: User | null = null;
  formattedGroups: GroupReformatted[] = [];
  userRole: string = '';
  channel: Channel | null = null;
  selectedGroup: GroupReformatted | null = null;
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
    const currentUser = this.authService.getCurrentUser();
    forkJoin({
      groups: this.groupService.getGroups(),
      channels: this.groupService.getChannels(),
      allUsers: this.userService.getUsers(),
      membership: this.authService.fetchMembership(currentUser?._id || ''),
    }).pipe(
      map(({ groups, channels, allUsers, membership }) => {
        // Refresh the user data
        this.user = allUsers.find(u => u._id === currentUser?._id) ?? currentUser;
        this.userRole = membership?.role || 'chatuser';
        // Filter groups with channels that belong to the user
        const filteredGroups = groups.filter(g => this.user?.groups.includes(g._id));
        const formattedGroups = filteredGroups.map(g => {
          return {
            ...g,
            channels: channels.filter(c => c.groupId === g._id)
          }
        });
        return { formattedGroups};
      })
    ).subscribe({
      next: (data) => {
        if (!data) {
          this.errMsg = 'User not found or access denied';
          return;
        }
        this.formattedGroups = data.formattedGroups;
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
  openLeaveGroupModal(group: GroupReformatted): void {
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmLeaveGroupModal')!).show();
  }

  // Leave a group
  confirmLeaveGroup(group: GroupReformatted, user: User, event: any): void {
    event.preventDefault();
    this.groupService.leaveGroup(group._id, user._id).subscribe({
      next: () => {
        this.formattedGroups = this.formattedGroups.filter(g => g._id !== group._id);
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



