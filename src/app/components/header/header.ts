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
export class Header implements OnInit {
  userrole: string = '';
  welcomeMsg: string = 'Welcome, ';
  username: string = '';

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  // userId$ = this.authService.currentUserId$;
  // username$ = this.authService.username$; 
  // role$ = this.authService.currentUser$.pipe(
  //   map(u => u ? u.role : 'Guest'),
  // )

  ngOnInit(): void {
    // const currentUser = this.authService.getCurrentUser();
    // console.log('Current user:', currentUser);
    // if (currentUser) {
    //   this.userrole = currentUser.role;
    //   this.welcomeMsg += currentUser.username;
    // } else {
    //   this.welcomeMsg = 'Welcome, Guest';
    // }
    // this.role$.subscribe(role => {
    //   this.userrole = role;
    // });
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      this.userrole = currentUser?.role || 'Guest';
      this.username = (currentUser?.username ?? 'Guest').charAt(0).toUpperCase() + (currentUser?.username ?? 'Guest').slice(1);
      this.welcomeMsg += this.username;
    }
    else {
      this.welcomeMsg = 'Welcome, Guest';
    }
  }
  
  logout(event: any): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
