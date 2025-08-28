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
  showUpdateRole: Record<number, boolean> = {};
  showDelete: Record<number, boolean> = {};
  newRole: Record<number, string> = {};
  selectedUser: User | null = null; 

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);
  declare bootstrap: any

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.groupService.getGroups().pipe(
      map(groups => {
        // Fetch groups that the current user administers
        const adminGroups = currentUser ? groups.filter(g => g.admins?.includes(currentUser.id)) : [];
        return adminGroups;
      }),
      switchMap(adminGroups => {
        return this.userService.getUsers().pipe(
          map(users => {
            return users.filter(u => 
              u.role !== 'super' && // Filter out super
              u.groups.some(ug => adminGroups.some(g => g.id === ug))
            );
            })
          )
      }
      )
    ).subscribe(users => this.users = users)
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