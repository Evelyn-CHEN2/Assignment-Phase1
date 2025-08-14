import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  userrole: string = '';
  welcomeMsg: string = 'Welcome, ';
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    if (currentUser) {
      this.userrole = currentUser.role;
      this.welcomeMsg += currentUser.username;
    } else {
      this.welcomeMsg = 'Welcome, Guest';
    }
  }
  
  logout(event: any): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
