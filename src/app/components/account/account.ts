import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface';
import { Group } from '../../interface';
import { GroupService } from '../../services/group.service';

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
  private groupService = inject(GroupService);

  ngOnInit(): void {
  //   // Get the user ID from localStorage
  //   const currentUser = this.authService.getCurrentUser();
  //   if (currentUser) {
  //     this.user = currentUser;
  //     this.userGroups = this.groupService.loadUserGroups(this.user.id);
  //     console.log('Current user on account page:', this.user);
  //   } else {
  //     console.log('No user on account page.');
  //   }
  // }
}
}
