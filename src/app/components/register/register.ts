import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  submitted = false;
  username: string = '';
  email: string ='';
  pwd: string = '';
  groups: string[] = [];
  errMsg: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  
  onSubmit(f: NgForm, event: any): void {
    event.preventDefault();
    this.errMsg = ''; // Reset error messages
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    this.authService.register(this.username, this.email, this.pwd).subscribe({
      next: (user: any) => {
        if (user.valid === true) {
          console.log('Registration successful:', user);
          this.authService.setCurrentUser(user); // Store registered user data to localStorage
          this.router.navigate(['/account']);
        } else {
          this.errMsg = 'Registration failed. Please try again.';
        }
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        this.errMsg = 'An error occurred during registration. Please try again later.';
      },
      complete: () => {
        console.log('Registration request completed.');
      }
    })
  
  }
}
