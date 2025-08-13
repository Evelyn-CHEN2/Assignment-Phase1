import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interface'


@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  users: User[] = [];

  private userService = inject(UserService)

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        console.log('All users fetched successfully:', this.users);
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      },
      complete: () => { 
        console.log('User fetching complete.');
      }
    });
  }
}
