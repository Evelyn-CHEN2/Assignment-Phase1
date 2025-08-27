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
  showUpdateRole: Record<number, boolean> = {};
  showDelete: Record<number, boolean> = {};
  newRole: Record<number, string> = {};
  selectedUser: User | null = null; 

  private userService = inject(UserService)
  private router = inject(Router);
  declare bootstrap: any

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