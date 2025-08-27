import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../interface';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { forkJoin, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  errMsg: string = '';
  userById: Record<number, string> = {};
  groupById: Record<string, string> = {};
  selectedNotification: Notification | null = null;

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  declare bootstrap: any;

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

  // Function to format date
  formatDate(id: string | number): string {
    const n = Number(id);
    if (Number.isFinite(n)) {
      const d = String(id).length >= 13 ? new Date(n) : new Date(n * 1000);
      return d.toLocaleString();
    }
    return String(id);
  }
  
  // Toggle approve application modal
  openApproveModal(notification: Notification): void {
    this.selectedNotification = notification;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('approveApplicationModal')!).show();
  }
  // Approve group application
  approve(notification: Notification, event: any): void {
    event.preventDefault();
    const userId = notification.applier; // Applier stores user ID
    const groupId = notification.groupToApply; // GroupToApply stores group ID
    this.groupService.addGroupToUser(userId, groupId, notification.id).subscribe({
      next: () => {
        // Update approved notification status to 'approved'
        this.notifications = this.notifications.map(n => 
          n.id === notification.id ? {...n, status: 'approved'} : n
        )
      },
      error: (err) => {
        this.errMsg = err.error.error|| 'An error occurred while approving the application.';
        console.error('Error approving application:', err);
      },
      complete: () => {
        console.log('Application approved successfully.');
      }
    });
  }

  // Toggle delete application modal
  openDeleteModal(notification: Notification): void {
    this.selectedNotification = notification;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteApplicationModal')!).show();
  }
  // Delete a notification
  delete(notification: Notification, event: any): void {
    event.preventDefault();
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        // Remove the deleted notification from the notifications array
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (err) => {
        this.errMsg = err.error.error || 'An error occurred while deleting the notification.';
        console.error('Error deleting notification:', err);
      },
      complete: () => {
        console.log('Notification deleted successfully.');
      }
    })
  }

}
