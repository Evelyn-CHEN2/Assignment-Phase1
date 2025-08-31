import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../interface';
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
  submitted = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log('User alreafy logged in: ', currentUser);
      // If user is super/admin, redirect to dashboard, otherwise to account page
      if (currentUser.role.includes('super') || currentUser.role.includes('admin')) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/account',currentUser.id]);
      }
    } else {
      console.log('No user logged in, redirecting to login page.');
      return;
    }
  }

  login(f: NgForm): void {
    this.errMsg = ''; 
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    // Check if the user is banned
    
    // Proceed with data sent back from server
    this.authService.login(this.username, this.pwd).subscribe({
      next: (user: User) => {
        if (user.valid === true) {
          this.authService.setCurrentUser(user, this.rememberMe);
          // If user is super/admin, redirect to dashboard after login, otherwise to account page
          if (user.role === 'super' || user.role === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/account', user.id]);
          } 
        } else {
          alert ('Your account has been banned. Please contact the administrator for more information.');
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.errMsg = err.error.error || 'Login failed. Please check your credentials and try again.';
      },
      complete: () => {
        console.info('Login request completed');
      }
    });
  }
}
