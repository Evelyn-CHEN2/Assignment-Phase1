import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface';
import { Group } from '../../interface';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  user: User | null = null;
  me: User | null = null;
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
        this.me = viewer;
        if (!this.me) {
          return of(null);
        }
        const userId = params['id'] || this.me.id;
        console.log('Fetching user with ID:', userId);
        return this.userService.getUserById(userId);
      })
    ).subscribe(user => this.user = user);
    
  }
}

