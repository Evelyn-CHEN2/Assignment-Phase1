import { Component, OnInit, inject } from '@angular/core';
import { Notification, User } from '../../interface';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  errMsg: string = '';
  applierName: string = '';
  userById: Record<number, string> = {};
  groupById: Record<string, string> = {};

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);

  ngOnInit(): void {
    // this.notificationService.fetchNotifications().subscribe({
    //   next: (data) => {
    //     console.log('Notifications data:', data);
    //     this.notifications = data;
    //   },
    //   error: (error) => {
    //     this.errMsg = error.error.error || 'Error fetching notifications';
    //   },
    //   complete: () => {
    //     console.log('Fetched notifications');
    //   }
    // })
    const currentUser = this.authService.getCurrentUser();
    this.notificationService.fetchNotifications().pipe(
      map((notifications: Notification[]) => {
        console.log('Notifications for admin:', notifications);
        return notifications.filter(n => n.groupCreator === currentUser?.id)
        
      }),
      switchMap((adminNotifications: Notification[]) => {
        // if (adminNotifications.length === 0) return of(null);
        return forkJoin({
          users: this.userService.getUsers(),
          groups: this.groupService.getGroups()
        }).pipe(
          map(({ users, groups }) => {
            const userById = Object.fromEntries(
              users.map(u => [u.id, u.username.charAt(0).toUpperCase() + u.username.slice(1)])
            )
            const groupById = Object.fromEntries(
              groups.map(g => [g.id, g.groupname])
            )
            return { adminNotifications, userById, groupById };
          })
        )
      })
    ).subscribe(({ adminNotifications, userById, groupById }) => {
      this.notifications = adminNotifications;
      this.userById = userById;
      this.groupById = groupById;
      
    })
  }

}
