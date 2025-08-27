import { Component, OnInit, inject } from '@angular/core';
import { Notification, User } from '../../interface';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { not } from 'rxjs/internal/util/not';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  notiStatus: string = '';
  errMsg: string = '';
  userById: Record<number, string> = {};
  groupById: Record<string, string> = {};

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);

  ngOnInit(): void {
    // Fetch all group applications for groups created by current super/admin
    const currentUser = this.authService.getCurrentUser();
    this.notificationService.fetchNotifications().pipe(
      map((notifications: Notification[]) => {
        console.log('Notifications for admin:', notifications);
        return notifications.filter(n => n.groupCreator === currentUser?.id)
        
      }),
      switchMap((adminNotifications: Notification[]) => {
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

  // Confirm group application
  approve(notification: Notification, event: any): void {
    event.preventDefault();
    const userId = notification.applier; // Applier stores user ID
    const groupId = notification.groupToApply; // GroupToApply stores group ID
    this.groupService.addGroupToUser(userId, groupId, notification.id).subscribe({
      next: () => {
        // Update notification status to 'approved'
        notification.status = 'approved';
      }
    });
   
  }
    





}
