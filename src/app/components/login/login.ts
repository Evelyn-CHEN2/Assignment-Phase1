import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  username: string = '';
  pwd: string = '';
  errMsg: string = '';
  rememberMe: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Checking current user on login page:', currentUser);
    if (currentUser) {
      console.log('User alreafy logged in: ', currentUser);
      // If user is super, redirect to dashboard, otherwise to account page
      if (currentUser.roles.includes('super')) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/account']);
      }
    } else {
      console.log('No user logged in, redirecting to login page.');
      return;
    }
  }

  login(event: any): void {
    event.preventDefault();
    this.errMsg = ''; 
    // Validate input fields
    if (this.username === '') {
      this.errMsg = 'User name is required.';
      return;
    }
    if (this.pwd === '') {
      this.errMsg = 'Password is required.';
      return;
    }
    // Proceed with data sent back from server
    this.authService.login(this.username, this.pwd).subscribe({
      next: (user: any) => {
        if (user.valid === true) {
          console.log('Login successful:', user);
          this.authService.setCurrentUser(user); //Store logged user data to localStorage
          // If user is super, redirect to dashboard after login, otherwise to account page
          if (user.roles.includes('super')) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/account'])
          } 
        }
        else {
          this.errMsg = 'Invalid username or password.';
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
      },
      complete: () => {
        console.info('Login request completed');
      }
    });
  }
}
