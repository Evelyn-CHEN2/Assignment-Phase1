import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginErrors } from '../../interface';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  username: string = '';
  pwd: string = '';
  errMsgs: LoginErrors = {};

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {

  }

  login(event: any): void {
    event.preventDefault();
    const errors: LoginErrors = {}; //Initialize an empty errors object
    this.errMsgs = errors; //Reset error messages
    
    if (!this.username) {
      this.errMsgs.username = 'User name is required.';
      return;
    }
    if (!this.pwd) {
      this.errMsgs.pwd = 'Password is required.';
      return;
    }

    this.authService.login(this.username, this.pwd).subscribe({
      next: (user) => {
        console.log('Login successful:', user.username);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errMsgs.general = 'Invalid username or password.';
      }
    });
  }
}
