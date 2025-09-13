import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { Group, Membership, User } from '../../interface'
import { forkJoin, map } from 'rxjs';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  users: User[] = [];
  loggedUser: User | null = null;
  userGroupsByUser: Record<string, Group[]> = {}; 
  roleByGroupByUser: Record<string, Record<string, string>> = {};
  roleByGroup: string = '';
  membership: Membership | null = null;
  showUserGroups: Record<string, boolean> = {};
  showUpdateRole: Record<string, boolean> = {}; 
  showDelete: Record<string, boolean> = {};
  newRole: Record<string, string> = {};
  userRole: string = '';
  selectedUser: User | null = null; 
  selectedGroup: Group | null = null;
  errMsg: string = '';
  sortAsc: boolean = true; // Sort groups order state

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);
  declare bootstrap: any

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.loggedUser = currentUser;
    forkJoin({
      groups: this.groupService.getGroups(),
      users: this.userService.getUsers(),
      membership: this.authService.fetchMembership(currentUser?._id || '')
    }).pipe(
      map(({ groups, membership, users }) => {
        // Fetch groups that current user administers
        const adminGroups = currentUser ? groups.filter(g => membership?.groups.includes(g._id)) : [];
        // Filter users that belong to the admin groups
        const adminUsers = users.filter(u => 
          u.groups.some(ug => adminGroups.some(ag => ag._id === ug))
        );
        // Fetch all groups for super
        return { groups, membership, adminUsers, users };
      })
    ).subscribe(({ users, adminUsers, groups, membership }) => {
      if (membership?.role === 'super') {
        this.users = users.filter(u => u._id !== this.loggedUser?._id); // Exclude super self
        this.userGroupsByUser = Object.fromEntries(
          this.users.map(u => { 
            const userGroups = groups.filter(g => u.groups.includes(g._id));
            return [u._id, userGroups];
          })
        )
      } else if (membership?.role === 'admin') {
        this.users = adminUsers.filter(u => u._id !== this.loggedUser?._id && u.isSuper === false); // Exclude admin self and supers
        this.userGroupsByUser = Object.fromEntries(
          this.users.map(u => { 
            const userGroups = groups.filter(g => u.groups.includes(g._id) && membership.groups.includes(g._id));
            return [u._id, userGroups];
          })
        )
      }
      // Fetch user role for each user in each group
      Object.entries(this.userGroupsByUser).map(([userId, userGroups]) => {
        // For each user, fetch their role in each group
        this.authService.fetchMembership(userId).subscribe(m => {
          const role = m?.role ?? 'chatuser'; 
          const userRoleByGroups = Object.fromEntries(userGroups.map(g => {
            if (m?.role === 'super') {
              const groupRole = 'super';
              return [g._id, groupRole];
            } else {
              const groupRole = m?.groups.includes(g._id) ? role : 'chatuser';
              return [g._id, groupRole];
            }
          }))
          this.roleByGroupByUser[userId] = userRoleByGroups; 
        })  
      })
      this.userRole = membership?.role || 'chatuser';
      this.errMsg = '';
    })
  }

  // Sort users by names
  sortUsers(): void{
    this.users.sort((a,b) => a.username.localeCompare(b.username));
    if (!this.sortAsc) {
      this.users.reverse();
    }
    this.sortAsc = !this.sortAsc;
  }

  // Tggle user groups display
  toggleUserGroups(user : User): void {
    this.showUserGroups[user._id] = !this.showUserGroups[user._id];
  }

  // Toggle ban confirmation modal
  openBanModal(user: User): void {
    this.selectedUser = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmBanModal')!).show();
  }

  // Ban user and report to super
  confirmBan(user: User, event: any): void {
    event.preventDefault();
    this.userService.banUser(user._id).subscribe({
      next: () => {
        user.valid = false;
      },
      error: (err: any) => {
        console.error('Error banning user:', err);
        this.errMsg = err.error.error || 'Error happened while banning a user.';
      },
      complete: () => { 
        console.log('User ban complete.');
      }
    })
  }

  // Toggle remove user from group confirmation modal
  openRemoveModal(user: User, group: Group): void {
    this.selectedUser = user;
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmRemoveModal')!).show();
  }

  // Remove user form the group
  confirmRemove(user: User, group: Group, event: any): void {
    event.preventDefault();
    this.userService.removeUserFromGroup(user._id, group._id).subscribe({
      next: () => {
        // Update user groups after removing the user from the group
        if (user) {
          this.userGroupsByUser[user._id] = this.userGroupsByUser[user._id].filter(g => g._id !== group._id);
        }
      },
      error: (err: any) => {
        console.error('Error removing user:', err);
        this.errMsg = err.error.error || 'Error happended while removing a user.';
      },
      complete: () => { 
        console.log('User remove complete.');
      }
    })
  }

  // Toggle delete dummy user confirmation modal
  openDeleteUserModal(user: User): void {
    this.selectedUser = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteUserModal')!).show();
  }
  // Delete a dummy user for super
  confirmDeleteUser(user: User, event: any): void {
    event.preventDefault();
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        // Remove user from the list after deletion
        this.users = this.users.filter(u => u._id !== user._id);
      },
      error: (err: any) => {
        console.error('Error deleting dummy user:', err);
        this.errMsg = err.error.error || 'Error happened while deleting a dummy user.';
      },
      complete: () => {
        console.log('User deletion complete.');
      }
    })
  }

   // Update user role
   toggleUpdateRole(user: User, group: Group): void {
    this.showUpdateRole[(`${user._id}: ${group._id}`)] = !this.showUpdateRole[(`${user._id}: ${group._id}`)];
  }

  // Toggle update confirmation modal
  openUpdateModal(user: User, group: Group): void {
    this.selectedUser = user;
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmUpdateModal')!).show();
  }
  
  // Update user role
  updateRole(user: User, group: Group, event: any): void {
    event.preventDefault();
    if (!user || !group) {
      console.error('User or Group is not defined');
      return;
    }
    const newRole = this.newRole[(`${user._id}: ${group._id}`)];
    this.userService.updateUserRole(newRole, user._id, group._id).subscribe({
      next: () => {
        // Update the UI 
        this.roleByGroupByUser[user._id][group._id] = newRole;
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
}


