import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../interface'

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  users: User[] = [];

  private userService = inject(UserService)
  private router = inject(Router);

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        console.log('All users fetched successfully:', this.users);
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      },
      complete: () => { 
        console.log('Groups fetching complete.');
      }
    });
  }

  updateRole(user: User & { _pendingAction?: string }): void {
    const action = user._pendingAction;
    if (!action) {
      return;
    }
    // Delete user
    if (action === 'delete') {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully:', user);
          // Remove the user from the local users array
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
        },
        complete: () => { 
          console.log('User deletion complete.');
          user._pendingAction = ''; // Reset pending action after deletion
        }
      });
      return;
    }
    // Update user role
    if (action === 'admin' || action === 'chatuser') {
      this.userService.updateUserRole(user.id, action).subscribe({
        next: (updatedUser: User) => {
          console.log('User role updated successfully: ', updatedUser);
          // Update the local users array
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (error: any) => {
          console.error('Error updating user role:', error);
        },
        complete: () => { 
          console.log('User role update complete.');
          user._pendingAction = ''; // Reset pending action after update
        }
      });
    }
  }

  // Navigate to user account
  navToAccount(user: User, event: any): void {
    event.preventDefault();
    console.log('Navigating to account for user from dashboard:', user);
    // Navigate to the account page for the selected user
    this.router.navigate(['/account', user.id])
  }
}