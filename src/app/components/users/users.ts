import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { Group, User } from '../../interface'
import { forkJoin, switchMap, map } from 'rxjs';
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
  // userGroupsByUser: Record<number, Group[]> = {}; 
  userGroups: Group[] = [];
  // roleByGroupByUser: Record<number, Record<string, string>> = {};
  roleByGroup: Record<string, string> = {};
  showUserGroups: Record<string, boolean> = {};
  showUpdateRole: Record<string,boolean> = {}; 
  showDelete: Record<string, boolean> = {};
  newRole: Record<string,string> = {};
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
      membership: this.authService.fetchMembership(currentUser?._id || '')
    }).pipe(
      map(({ groups, membership }) => {
        // Fetch groups that current user administers
        const adminGroups = currentUser ? groups.filter(g => membership?.groups.includes(g._id)) : [];
        // Fetch all groups for super
        const allGroups = groups;
        return { adminGroups, allGroups, membership };

      }),
      switchMap(({ adminGroups, allGroups, membership }) => {
        return this.userService.getUsers().pipe(
          map(users => {
            const allUsers = users;
            const adminUsers = users.filter(u => 
              u.groups.some(ug => adminGroups.some(ag => ag._id === ug)) // Filter users who are in groups administered by current user
            );
            return { allUsers, adminUsers, allGroups, adminGroups, membership };
            })
          )
      }
      )
    ).subscribe(({ allUsers, adminUsers, allGroups, adminGroups, membership }) => {
      if (membership?.role === 'super') {
        this.users = allUsers.filter(u => u._id !== this.loggedUser?._id); // Exclude super self
        // this.userGroupsByUser = Object.fromEntries(
        //   this.users.map(u => { 
        //     const groups = allGroups.filter(g => u.groups.includes(g._id));
        //     return [u._id, groups];
        //   })
        // )
        this.userGroups = allGroups.filter(g => {
          this.users.some(u => u.groups.includes(g._id));
        });
      } else if (membership?.role === 'admin') {
        this.users = adminUsers.filter(u => u._id !== this.loggedUser?._id); // Exclude admin self
        this.userGroups = adminGroups.filter(g => {
          this.users.some(u => u.groups.includes(g._id));
        });
      }
       // Fetch user role for each user in each group
      this.roleByGroup = Object.fromEntries(
        this.userGroups.map(ug => {
          const userRole = membership.groups.includes(ug._id) ? 'admin' : 'chatuser';
          return [ug._id, userRole];
        })
      );
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

  // Toggle delete confirmation modal
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
        this.userGroups = this.userGroups.filter(g => g._id !== group._id);
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

   // Update user role
   toggleUpdateRole(group: Group): void {
    this.showUpdateRole[group._id] = !this.showUpdateRole[group._id];
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
    const newRole = this.newRole[user._id];
    this.userService.updateUserRole(newRole, user._id, group._id).subscribe({
      next: () => {
        // Update the UI 
        this.roleByGroup[group._id] = newRole;
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