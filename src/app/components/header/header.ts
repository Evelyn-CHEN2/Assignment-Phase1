import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  username: string = '';
  remember: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  user$ = this.authService.currentUser$;

  userRole$ = this.authService.membership$.pipe( 
    map(m => m?.role ? m.role : 'chatuser'));

  ngOnInit(): void {
    this.user$.subscribe(u => console.log('user value:', u));
    this.userRole$.subscribe(r => console.log('role value:', r));
  }
  logout(event: any): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
