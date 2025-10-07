import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, tap } from 'rxjs';
import { map, combineLatest } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  user$ = this.authService.currentUser$.pipe(
    tap(u => console.log('[user$]', u))
  );
  userRole$ = combineLatest([
    this.authService.currentUser$,
    this.authService.membership$
  ]).pipe(
    map(([user, membership]) =>
      (user?.isSuper ? 'super' : membership?.role) || 'chatuser'
    )
  );

  constructor() {
    this.userRole$.subscribe(r => console.log('ROLE:', r));
  }

  logout(event: any): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
