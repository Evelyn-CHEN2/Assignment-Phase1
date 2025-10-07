import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Notifications } from './notifications';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { BanReport, Channel, Group, User, Notification } from '../../interface';
import { of } from 'rxjs';

describe('Notifications', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let userSpy: jasmine.SpyObj<UserService>;
  let groupSpy: jasmine.SpyObj<GroupService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

    const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: true };
    const allUsers: User[] = [
      { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false },
      { _id: 'u2', username: 'jerry', pwd: '1234', email: 'jerry@com', groups: ['g1', 'g2'], valid: true, avatar: '', isSuper: false },
      { _id: 'u3', username: 'eve', pwd: '1234', email: 'eve@com', groups: [], valid: true, avatar: '', isSuper: false }
    ];
    const groups: Group[] = [
      { _id: 'g1', groupname: 'test1', description: 'test1', channels: ['c11', 'c12'], createdBy: '' }, 
      { _id: 'g2', groupname: 'test2', description: 'test2', channels: [], createdBy: '' }, 
      { _id: 'g3', groupname: 'test3', description: 'test3', channels: ['c13'], createdBy: '' }
    ];
    const channels: Channel[] = [
      { _id: 'c11', channelname: 'channel1', groupId: 'g1', chatMsg: [] }, 
      { _id: 'c12', channelname: 'channel2', groupId: 'g1', chatMsg: [] },
      { _id: 'c13', channelname: 'channel3', groupId: 'g3', chatMsg: [] },
    ];

    const notifications: Notification[] = [
      { _id: 'n1', applier: 'u3', groupToApply: 'g1', status: 'pending', approvedBy: '', timestamp: new Date() },
      { _id: 'n2', applier: 'u3', groupToApply: 'g3', status: 'pending', approvedBy: '', timestamp: new Date() },
    ];
  
    const banReports: BanReport[] = [
      { _id: 'b1', userId: 'u2', channelIds: ['c11', 'c13'] }
    ];

    const event: any = { preventDefault: jasmine.createSpy('preventDefault')};

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'fetchMembership']);
    userSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers', 'addGroupToUser', 'unBanUser']);
    groupSpy = jasmine.createSpyObj<GroupService>('GroupService', ['getGroups', 'getChannels']);
    notificationSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['deleteNotification', 'fetchNotifications', 'fetchBanReports'])
    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: authSpy},
        { provide: UserService, useValue: userSpy},
        { provide: GroupService, useValue: groupSpy},
        { provide: NotificationService, useValue: notificationSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Test ngOnInit
  it('should return when no current user', () => {
    authSpy.getCurrentUser.and.returnValue(null as any);

    fixture.detectChanges();

    expect(component.loggedUser).toBe(null);
    expect(component.notifications).toEqual([]);
  });

  it('should load all data for super', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    userSpy.getUsers.and.returnValue(of(allUsers));
    groupSpy.getGroups.and.returnValue(of(groups));
    groupSpy.getChannels.and.returnValue(of(channels));
    notificationSpy.fetchNotifications.and.returnValue(of(notifications));
    notificationSpy.fetchBanReports.and.returnValue(of(banReports));
    authSpy.fetchMembership.and.returnValue(of({
      _id: 'm1', role: 'super', admin: 'u1', groups: []
    }));

    fixture.detectChanges();

    expect(component.userRole).toBe('super');
    expect(component.notifications).toEqual(notifications);
    expect(component.userById['u3']).toBe('Eve');
    expect(component.groupById['g1']).toBe('test1');
    expect(component.channelById['c11']).toBe('channel1');
    expect(component.banReports).toEqual(banReports);
    expect(component.loggedUser).toEqual(currentUser);
    expect(component.errMsg).toBe('');
  });

  it('should load filtered data for admin', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    userSpy.getUsers.and.returnValue(of(allUsers));
    groupSpy.getGroups.and.returnValue(of(groups));
    groupSpy.getChannels.and.returnValue(of(channels));
    notificationSpy.fetchNotifications.and.returnValue(of(notifications));
    notificationSpy.fetchBanReports.and.returnValue(of(banReports));
    authSpy.fetchMembership.and.returnValue(of({
      _id: 'm2', role: 'admin', admin: 'u1', groups: ['g1', 'g2']
    }));

    fixture.detectChanges();

    expect(component.userRole).toBe('super');
    expect(component.notifications?.[0]._id).toBe('n1');
    expect(component.userById['u3']).toBe('Eve');
    expect(component.groupById['g1']).toBe('test1');
    expect(component.channelById['c11']).toBe('channel1');
    expect(component.loggedUser).toEqual(currentUser);
    expect(component.errMsg).toBe('');
  });

  // Test approve notification
  it('should return if current user null', () => {
    authSpy.getCurrentUser.and.returnValue(null as any);
    const notification: Notification = { _id: 'n3', applier: 'u3', groupToApply: 'g1', status: 'pending', approvedBy: '', timestamp: new Date()}

    component.approve(notification, event)

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.loggedUser).toBe(null);
    expect(userSpy.addGroupToUser).not.toHaveBeenCalled();
  });

  it('should add group to user and change notification status, update UI', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    userSpy.addGroupToUser.and.returnValue(of(void 0));
    component.notifications = notifications;
    const notification = component.notifications[1]; // n2
    spyOn(console, 'log');

    component.approve(notification, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(userSpy.addGroupToUser).toHaveBeenCalledWith(currentUser._id, 'u3', 'g3', 'n2');
    expect(component.notifications).toEqual([
      { _id: 'n1', applier: 'u3', groupToApply: 'g1', status: 'pending', approvedBy: '', timestamp: jasmine.any(Date) },
      { _id: 'n2', applier: 'u3', groupToApply: 'g3', status: 'approved', approvedBy: 'u1', timestamp: jasmine.any(Date) }
    ]);
    expect(console.log).toHaveBeenCalledWith('Application approved successfully.')
  });
 
  // Test delete notification
  it('should delete notification form lists', () => {
    notificationSpy.deleteNotification.and.returnValue(of(void 0));
    component.notifications = notifications;
    const notification = component.notifications[1]; // n2
    spyOn(console, 'log');

    component.delete(notification, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(notificationSpy.deleteNotification).toHaveBeenCalledWith('n2');
    expect(component.notifications.map(n=>n._id)).toEqual(['n1']);
    expect(console.log).toHaveBeenCalledWith('Notification deleted successfully.');
  }); 

  // Test unban user
  it('should return if userId and channelId null', () => {
    component.userId = (null as any);
    component.channelId = (null as any);

    component.unBan(component.userId, component.channelId, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(userSpy.unBanUser).not.toHaveBeenCalled();
  });

  it('should remove user from reports, and undisable channelId link', () => {
    component.banReports = banReports;
    userSpy.unBanUser.and.returnValue(of(void 0));
    component.userId = 'u2';
    component.channelId = 'c11';
    spyOn(console, 'log');

    component.unBan('u2', 'c11', event);

    expect(userSpy.unBanUser).toHaveBeenCalledWith('u2', 'c11');
    expect(component.banReports).toEqual([
      { _id: 'b1', userId: 'u2', channelIds: ['c13'] }
    ]);
    expect(console.log).toHaveBeenCalledWith('User unbanned successfully.');
    expect(component.errMsg).toBe('');
  });

});
