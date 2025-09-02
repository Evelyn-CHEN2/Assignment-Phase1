import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { Group, User } from '../../interface'
import { forkJoin, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  users: User[] = [];
  loggedUser: User | null = null;
  userGroupsByUser: Record<number, Group[]> = {}; 
  roleByGroupByUser: Record<number, Record<string, string>> = {};
  showUserGroups: Record<number, boolean> = {};
  showDelete: Record<number, boolean> = {};
  newRole: Record<number, string> = {};
  selectedUser: User | null = null; 
  selectedGroup: Group | null = null;
  errMsg: string = '';

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);
  declare bootstrap: any

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.loggedUser = currentUser;
     this.groupService.getGroups().pipe(
      map(groups => {
        // Fetch groups that the current user administers
        const adminGroups = currentUser ? groups.filter(g => g.admins?.includes(currentUser.id)) : [];
        // Fetch all groups if current user is super
        const allGroups = groups;
        return { adminGroups, allGroups };

      }),
      switchMap(({ adminGroups, allGroups }) => {
        return this.userService.getUsers().pipe(
          map(users => {
            const allUsers = users;
            const adminUsers =  users.filter(u => 
              u.role !== 'super' && // Filter out super
              u.groups.some(ug => adminGroups.some(ag => ag.id === ug)) // Filter users who are in groups administered by current user
            );
            return { allUsers, adminUsers, allGroups, adminGroups };
            })
          )
      }
      )
    ).subscribe(({ allUsers, adminUsers, allGroups, adminGroups }) => {
      if (currentUser?.role === 'super') {
        this.users = allUsers.filter(u => u.id !== currentUser.id)
        this.userGroupsByUser = Object.fromEntries(
          this.users.map(u => {
            const groups = allGroups.filter(g => u.groups.includes(g.id));
            return [u.id, groups];
          })
        )
        // Fetch user role for each user in each group
        this.roleByGroupByUser = Object.fromEntries(
          Object.entries(this.userGroupsByUser).map(([userId, groups]) => {
            const userRoleByGroups = Object.fromEntries(
              groups.map(g => {
                const userRole = g.admins.includes(Number(userId)) ? 'admin' : 'chatuser';
                return [g.id, userRole];
              })
            );
            return [Number(userId), userRoleByGroups];
          })
        );
      } else if (currentUser?.role === 'admin') {
        this.users = adminUsers.filter(u => u.id !== currentUser.id); // Exclude admin self
        this.userGroupsByUser = Object.fromEntries(
          this.users.map(u => {
            const groups = adminGroups.filter(g => u.groups.includes(g.id));
            return [u.id, groups];
          })
        );
        // Fetch user role for each user in each group
        this.roleByGroupByUser = Object.fromEntries(
          Object.entries(this.userGroupsByUser).map(([userId, groups]) => {
            const userRoleByGroups = Object.fromEntries(
              groups.map(g => {
                const userRole = g.admins.includes(Number(userId)) ? 'admin' : 'chatuser';
                return [g.id, userRole];
              })
            );
            return [Number(userId), userRoleByGroups];
          })
        );
      }

      this.errMsg = '';
    })
  }

  // Tggle user groups display
  toggleUserGroups(user : User): void {
    this.showUserGroups[user.id] = !this.showUserGroups[user.id];
  }

  // Toggle ban confirmation modal
  openAlertModal(user: User): void {
    this.selectedUser = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmAlertModal')!).show();
  }

  // Ban user and report to super
  confirmBan(user: User, event: any): void {
    event.preventDefault();
    this.userService.banUser(user.id).subscribe({
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
    this.userService.removeUserFromGroup(user.id, group.id).subscribe({
      next: () => {
        // Update user groups after removing the user from the group
        this.userGroupsByUser[user.id] = this.userGroupsByUser[user.id].filter(g => g.id !== group.id);
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
}