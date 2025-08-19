import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface';
import { Group } from '../../interface';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  user: User | null = null;
  userGroups: Group[] = []

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        // Check if user is super or admin
        const viewer = this.authService.getCurrentUser();
        if (!viewer || (viewer.role !== 'super' && viewer.role !== 'admin')) {
          console.warn('Access denied: User is not super or admin');
          return of(null);
        };
        // Fetch user by ID from route params or current user
        const userId = params['id'] || viewer.id;
        console.log('Fetching user with ID:', userId);
        return this.userService.getUserById(userId);
      }),
      switchMap(user => {
        if (!user) {
          console.warn('User not found or access denied');
          return of(null);
        };
        this.user = user;
        // Fetch groups for the user
        return this.groupService.getGroups().pipe(
          map(groups => groups.filter(g => user.groups.includes(g.id)))
        );
      })
    ).subscribe(groups => this.userGroups = groups || []);
  
  }
}

