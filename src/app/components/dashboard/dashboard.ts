import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userRole: string = ''; 

  private authService = inject(AuthService);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.authService.fetchMembership(currentUser?._id || '').subscribe(m => {
      if (m && m.role) {
        this.userRole = m.role;
      } else {
        this.userRole = currentUser?.isSuper ? 'super' : 'chatuser';
      }
    })
  }
}