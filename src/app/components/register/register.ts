import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';  
import { Group, User } from '../../interface';
import { GroupService } from '../../services/group.service';
 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, NgSelectModule],
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
  availableGroups: Group[] = [];
  selectedGroupIds: string[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);

  onReset(f: NgForm): void {
    this.errMsg = '';
    this.submitted = false;
    f.resetForm();
  }

  register(f: NgForm): void {
    this.errMsg = ''; 
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    this.authService.register(this.username, this.email, this.pwd).subscribe({
      next: (user: User) => {
        // Store registered user data to localStorage
        this.authService.setCurrentUser(user); 
        this.router.navigate(['/account']);
      },
      error: (err: any) => {
        console.error('Registration error:', err);
        this.errMsg = err.error.error || 'Registration failed. Please try again.';
      },
      complete: () => {
        console.log('Registration request completed.');
        this.errMsg = '';
      }
    })
  
  }
}
