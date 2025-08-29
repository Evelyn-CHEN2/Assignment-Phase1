import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { User } from '../../interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  user: User | null = null;

  private authService = inject(AuthService);

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      console.warn('No user logged in, redirecting to login page.');
      // Redirect to login page if no user is logged in
      this.authService.logout();
    } else {
      console.log('Current user:', this.user);
    };
  }
  
}