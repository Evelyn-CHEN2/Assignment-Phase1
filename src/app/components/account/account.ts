import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Group, Channel, User } from '../../interface';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  user: User | null = null;
  viewer: User | null = null;
  userGroups: Group[] = [];
  channel: Channel | null = null;
  selectedGroup: Group | null = null; 
  

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  declare bootstrap: any;

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const viewer = this.authService.getCurrentUser();
        this.viewer = viewer;
        // Get the user ID from route parameters or use the viewer's ID
        const userId = params['id'] || (viewer ? viewer.id : null);
        console.log('Fetching user with ID:', userId);
        return this.userService.getUserById(userId);
      }),
      // Fetch groups/channels for the user
      switchMap(user => {
        if (!user) {
          console.warn('User not found or access denied');
          return of(null); // SwithchMap expects an Observable, return of(null) to avoid breaking the stream
        };
        this.user = user;
        return forkJoin({
          groups: this.groupService.getGroups(),
          channels: this.groupService.getChannels()
        }).pipe(
          map(({ groups, channels }) => {
            return groups.filter(g => user.groups.includes(g.id)).map(group => ({
                ...group,
                channels: channels.filter(c => c.groupid === group.id)
            }));
          })
        );
      }),
    ).subscribe(groups => this.userGroups = groups || []);
  }

  // Toggle delete confirmation modal
  openDeleteModal(user: User): void {
    this.user = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')!).show();
  }

  // Delete user account, operated by logged user self
  confirmDeleteUser(user: User, event: any): void {
    event.preventDefault();
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        console.log('User self deleted successfully:', user);
        this.authService.setCurrentUser(null, false); // Clear current user
        this.router.navigate(['/login']);
      }, 
      error: (error: any) => {
        console.error('Error deleting user self:', error);
      },
      complete: () => {
        console.log('User self deletion complete.');
      }
    })
  }

  // Toggle to leave group
  openLeaveGroupModal(group: Group): void {
    this.selectedGroup = group;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmLeaveGroupModal')!).show();
  }

  // Leave a group
  confirmLeaveGroup(group: Group, user: User, event: any): void {
    event.preventDefault();
    this.groupService.deleteGroupFromUser(group.id, user.id).subscribe({
      next: () => {
        console.log('User left group successfully:', group);
        this.userGroups = this.userGroups.filter(g => g.id !== group.id);
      }, 
      error: (error: any) => {
        console.error('Error leaving group:', error);
      },
      complete: () => {
        console.log('Leave group request completed.');
      }
    });
  }

  // Choose the channel to join
  joinChannel(channel: Channel): void {
    this.channel = channel;
    console.log('Joining channel:', channel);
    // Navigate to the chat window with the selected channel
    this.router.navigate(['/chatwindow', channel.id])
  }
}



