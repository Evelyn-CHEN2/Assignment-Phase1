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

  onReset(f: NgForm): void {
    this.errMsg = '';
    this.submitted = false;
    f.resetForm();
  }
  
  register(f: NgForm): void {
    this.errMsg = ''; // Reset error messages
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    this.authService.register(this.username, this.email, this.pwd).subscribe({
      next: (user: any) => {
        if (user.valid === true) {
          console.log('Registration successful:', user);
          // Store registered user data to localStorage
          this.authService.setCurrentUser(user); 
          this.router.navigate(['/account']);
        }
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        this.errMsg = error.error.error || 'Registration failed. Please try again.';
      },
      complete: () => {
        console.log('Registration request completed.');
      }
    })
  
  }
}
