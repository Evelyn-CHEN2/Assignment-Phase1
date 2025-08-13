import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  user: User | null = null;

  private authService = inject(AuthService);

  ngOnInit(): void {
    // Get the user ID from localStorage
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      console.log('Current user on account page:', this.user);
    } else {
      console.log('No user on account page.');
    }
  }
}
