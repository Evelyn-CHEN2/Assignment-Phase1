import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, User } from '../../interface';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { forkJoin, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  bannedUsers: User[] = [];
  loggedUser: User | null = null;
  userRole: string = '';
  errMsg: string = '';
  userById: Record<string, string> = {};
  groupById: Record<string, string> = {};
  selectedNotification: Notification | null = null;
  bannedUser: User | null = null;

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  declare bootstrap: any;

  ngOnInit(): void {
    // Fetch all group applications for groups created by current super/admin
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    this.loggedUser = currentUser;

    forkJoin({
      users: this.userService.getUsers(),
      groups: this.groupService.getGroups(),
      notifications: this.notificationService.fetchNotifications(),
      membership: this.authService.fetchMembership(currentUser?._id || ''),
    }).pipe(
      map(({ users, groups, membership, notifications }) => {
        const userById = Object.fromEntries(
          users.map(u => [String(u._id), u.username.charAt(0).toUpperCase() + u.username.slice(1)])
        )
        const groupById = Object.fromEntries(
          groups.map(g => [String(g._id), g.groupname])
        )
        this.userRole = membership?.role || '';
        // Filter notifications for groups administered by current user(admin)
        const adminNotifications = notifications.filter(n => { 
          const groupApplying = groups.find(g => g._id === n.groupToApply);
          if (!groupApplying) return false;
          return membership?.admin === this.loggedUser?._id && membership?.groups?.includes(groupApplying?._id);
        });
        return { notifications, adminNotifications, userById, groupById, users };
      })
    ).subscribe(({ notifications, adminNotifications, userById, groupById, users }) => {
        this.notifications = this.userRole === 'super' ? notifications : adminNotifications;
        this.userById = userById;
        this.groupById = groupById;
        this.bannedUsers = users.filter(u => u.valid === false);
        this.errMsg = '';
      }); 
  }
  
  // Toggle approve application modal
  openApproveModal(notification: Notification): void {
    this.selectedNotification = notification;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('approveApplicationModal')!).show();
  }

  // Approve group application
  approve(notification: Notification, event: any): void {
    event.preventDefault();
    const currentUser = this.authService.getCurrentUser(); // The user who approves the application
    if (!currentUser) return;
    const approverId = currentUser._id;
    const applierId = notification.applier; // Applier stores user ID
    const groupId = notification.groupToApply; // GroupToApply stores group ID
    this.userService.addGroupToUser(approverId, applierId, groupId, notification._id).subscribe({
      next: () => {
        // Update approved notification status to 'approved'
        this.notifications = this.notifications.map(n => 
          n._id === notification._id ? {
            ...n, 
            status: 'approved',
            approvedBy: approverId
          } : n
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
    this.notificationService.deleteNotification(notification._id).subscribe({
      next: () => {
        // Remove the deleted notification from the notifications array
        this.notifications = this.notifications.filter(n => n._id !== notification._id);
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

  // Toggle unban modal
  openUnbanModal(user: User): void {
    this.bannedUser = user;
    this.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmUnbanModal')!).show();
  }

  // Unban a user
  unBan(user: User, event: any): void {
    event.preventDefault();
    if (!user) return;
    this.userService.unBanUser(user._id).subscribe({
      next: () => {
        // Remove the unbanned user from the bannedUsers array
        this.bannedUsers = this.bannedUsers.filter(u => u._id !== user._id);
      },
      error: (err: any) => {
        this.errMsg = err.error.error || 'An error occurred while unbanning the user.';
        console.error('Error unbanning user:', err);
      },
      complete: () => {
        console.log('User unbanned successfully.');
      }
    })
  }

}
