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
  channel: Channel | null = null;
  selectedGroup: Group | null = null;
  showUpdateRole: Record<string, boolean> = {}; 
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
    this.route.params.pipe(
      switchMap(params => {
        const viewer = this.authService.getCurrentUser();
        // Get the user ID from route parameters or use the viewer's ID
        const userId = params['id'] || (viewer ? viewer.id : null);
        this.viewer = viewer;
        return this.userService.getUserById(userId);
      }),
      // Fetch groups/channels for the user
      switchMap(user => {
        if (!user) {
          console.warn('User not found or access denied');
          return of(null); // SwithchMap expects an Observable, return of(null) to avoid breaking the stream
        };
        this.user = user;
        return forkJoin({
          groups: this.groupService.getGroups(),
          channels: this.groupService.getChannels()
        }).pipe(
          map(({ groups, channels }) => {
            // Fetch all groups with channels for super
            const allGroups = groups.map(g => {
              return {
                ...g,
                channels: channels.filter(c => c.groupid === g.id)
              }
            });
            // Filter groups with channels that belong to the user, exclude super
            const filteredGroups = groups.filter(g => user.groups.includes(g.id)).map(group => {
              return {
                ...group,
                channels: channels.filter(c => c.groupid === group.id)
              }
            });
            return { allGroups, filteredGroups };
          }),
          tap(({filteredGroups}) => {
            // Display the role of the user in each group
            this.roleByGroup = Object.fromEntries(
              filteredGroups.map(g => {
                if (g.admins.includes(user.id)) {
                  return [g.id, user.role];
                } else {
                  return [g.id, 'chatuser'];
                }
              })
            )
          }
          )
        );
      }),
    ).subscribe({
      next: (result) => {
        if (!result) {
          this.errMsg = 'User not found or access denied';
          return;
        }
        const { allGroups, filteredGroups } = result;
        if(this.user?.role !== 'super') {
          this.userGroups = filteredGroups;
        } else {
          this.userGroups = allGroups;
        }
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

  // <-- Operations for super -->
  // Update user role
  toggleUpdateRole(group: Group): void {
    this.showUpdateRole[group.id] = !this.showUpdateRole[group.id];
  }
  
  // Update user role
  updateRole(user: User, group: Group) {
    if (!user || !group) {
      console.error('User or Group is not defined');
      return;
    }
    const newRole = this.newRole[group.id];
    this.userService.updateUserRole(newRole, user.id, group.id).subscribe({
      next: () => {
        // Update the UI display 
        this.roleByGroup[group.id] = newRole;
      },
      error: (err: any) => {
        console.error('Error updating user role:', err);
        this.errMsg = err.error?.error || 'An error occurred while updating the user role.';
      },
      complete: () => { 
        console.log('User role update complete.');
      }
    })
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
    this.userService.deleteUser(user.id).subscribe({
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
    this.groupService.deleteGroupFromUser(group.id, user.id).subscribe({
      next: () => {
        this.userGroups = this.userGroups.filter(g => g.id !== group.id);
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
    this.router.navigate(['/chatwindow', channel.id])
  }
}



