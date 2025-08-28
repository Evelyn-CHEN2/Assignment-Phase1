import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface'
import { switchMap, map } from 'rxjs';

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
  showUpdateRole: Record<number, boolean> = {};
  showDelete: Record<number, boolean> = {};
  newRole: Record<number, string> = {};
  selectedUser: User | null = null; 
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
        return adminGroups;
      }),
      switchMap(adminGroups => {
        return this.userService.getUsers().pipe(
          map(users => {
            const allUsers = users;
            const adminUsers =  users.filter(u => 
              u.role !== 'super' && // Filter out super
              u.groups.some(ug => adminGroups.some(ag => ag.id === ug)) // Filter users who are in groups administered by current user
            );
            return { allUsers, adminUsers };
            })
          )
      }
      )
    ).subscribe(({ allUsers, adminUsers }) => {
      if (currentUser?.role === 'super') {
        this.users = allUsers.filter(u => u.id !== currentUser.id); // Exclude self
      } else if (currentUser?.role === 'admin') {
        this.users = adminUsers.filter(u => u.id !== currentUser.id); // Exclude self
      }
    })
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
        console.log('User banned successfully:', user);
      },
      error: (err: any) => {
        console.error('Error banning user:', err);
        this.errMsg = err.error.error;
      },
      complete: () => { 
        console.log('User ban complete.');
      }
    })
  }

  // Toggle delete confirmation modal
  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')!).show();
  }
  // Delete user
  confirmDelete(user: User, event: any): void {
    event.preventDefault();
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        console.log('User deleted successfully:', user);
        // Remove the deleted user from the users array
        this.users = this.users.filter(u => u.id !== user.id);
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
      },
      complete: () => { 
        console.log('User deletion complete.');
      }
    })
  }

  // Navigate to user account
  navToAccount(user: User, event: any): void {
    event.preventDefault();
    console.log('Navigating to account for user from dashboard:', user);
    // Navigate to the account page for the selected user
    this.router.navigate(['/account', user.id])
  }
}