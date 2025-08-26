import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  welcomeMsg: string = 'Welcome, ';
  username: string = '';
  remember: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  user$ = this.authService.currentUser$;
  userRole$ = this.user$.pipe(
    map(u => u ? u.role : [])
  );

  logout(event: any): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
