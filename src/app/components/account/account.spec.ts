import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { provideRouter} from '@angular/router';
import { Router } from '@angular/router';
import { Group, Channel, User, Membership, BanReport } from '../../interface';
import { of, throwError } from 'rxjs';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Account } from './account';

describe('Account', () => {
  let comp: Account;
  let fixture: ComponentFixture<Account>;

  // Mock services
  let authSpy: jasmine.SpyObj<AuthService>;
  let groupSpy: jasmine.SpyObj<GroupService>;
  let userSpy: jasmine.SpyObj<UserService>;
  let notifySpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Dummy data
  const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
  const allUsers: User[] = [
    { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false },
    { _id: 'u2', username: 'jerry', pwd: '1234', email: 'jerry@com', groups: ['g1', 'g2'], valid: true, avatar: '', isSuper: false },
    { _id: 'u3', username: 'eve', pwd: '1234', email: 'eve@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false }
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
  const membership: Membership = { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g3'] }
  
  const banReports: BanReport[] = [
    { _id: 'b1', userId: 'u3', channelIds: ['c11'] }
  ];
  const user: User = { _id: 'u3', username: 'eve', pwd: '', email: '', groups: [], valid: true, avatar: '', isSuper: false};
  const event: any = { preventDefault: jasmine.createSpy('preventDefault')};
  const group: any = { _id: 'g3', groupname: 'test3', description: 'test3', channels: [], createdBy: '' };

  beforeEach(async () => {
    // Create mock services with methods
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'fetchMembership', 'setCurrentUser']);
    groupSpy = jasmine.createSpyObj<GroupService>('GroupService', ['getGroups', 'getChannels', 'leaveGroup']);
    userSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers', 'deleteUser', 'uploadAvatar']);
    notifySpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['fetchBanReports']);
    routerSpy = jasmine.createSpyObj<Router>('Route', ['navigate'])

    await TestBed.configureTestingModule({
      imports: [Account],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: GroupService, useValue: groupSpy },
        { provide: UserService, useValue: userSpy },
        { provide: NotificationService, useValue: notifySpy },
        { provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Account);
    comp = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(comp).toBeTruthy();
  });
  //  Test ngOnInit
  it('should get user information from services',() => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    groupSpy.getGroups.and.returnValue(of(groups));
    groupSpy.getChannels.and.returnValue(of(channels));
    userSpy.getUsers.and.returnValue(of(allUsers));
    authSpy.fetchMembership.and.returnValue(of(membership));
    notifySpy.fetchBanReports.and.returnValue(of(banReports));

    fixture.detectChanges();
    expect(comp.user).toEqual(allUsers[0]);
    expect(comp.formattedGroups.map(g => g._id)).toEqual(['g1', 'g3'])
    expect(comp.userRole).toBe('admin');
    expect(comp.bannedChannels).toEqual(['c11']);
    expect(comp.bannedUsers).toEqual(['u3']);
    expect(comp.errMsg).toBe('');
  });

  // Test function openDeleteModal
  it('should set this.user to the selected user when delete modal toggled', () => {
    expect(comp.user).toBe(null);
    comp.openDeleteModal(user);
    expect(comp.user).toBe(user)
  })

  // Test function confirmDeleteUser
  it('should delete user, clear current user, nad navigate to login page', () => {
    userSpy.deleteUser.and.returnValue(of(void 0));
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    comp.confirmDeleteUser(user, event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(userSpy.deleteUser).toHaveBeenCalledWith('u3');
    expect(authSpy.setCurrentUser).toHaveBeenCalledOnceWith(null, false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(comp.errMsg).toBe('')
  })

  // Test function confirmLeaveGroup
  it('should delete groupId from user groups', () => {
    comp.formattedGroups = [
      { _id: 'g1', groupname: 'Test Group' },
      { _id: 'g3', groupname: 'Other Group' }
    ] as any;
    groupSpy.leaveGroup.and.returnValue(of(void 0));

    comp.confirmLeaveGroup(group, user, event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(groupSpy.leaveGroup).toHaveBeenCalledWith('g3','u3');
    expect(comp.formattedGroups.map(g => g._id)).toEqual(['g1']);
    expect(comp.errMsg).toBe('')
  })

  // Test function changAvatar
  it('should set avatarFile and avatarSrc when a image is uploaded', () => {
    const file = new File(['dummy'], 'avatar.png', { type: 'image/png'});
    const result = 'data:image/png;base64,fakedata';
    const fileReader: any = {
      readAsDataURL: jasmine.createSpy('readAsDataUrl').and.callFake(function(this: any) {
        this.onload({});
      }),
      result: result,
      onload: null
    };

    spyOn(window as any, 'FileReader').and.returnValue(fileReader);
    const fileEvent = { target: { files: [file]}}

    comp.changeAvatar(fileEvent);
    expect(comp.avatarFile).toBe(file);
    expect(fileReader.readAsDataURL).toHaveBeenCalledWith(file);
    expect(comp.avatarSrc).toBe(result)
  })

  it('should do nothing if no file selected', () => {
    const fileEvent = { target: { files: []}};

    comp.changeAvatar(fileEvent);
    expect(comp.avatarFile).toBe(null);
    expect(comp.avatarSrc).toBe('');
  })

  // Test function saveEdit()
  it('should save avatar to user.avatar and update avatarSrc', () => {
    const file = new File(['dummy'], 'avatar.png', { type: 'image/png'});
    const result = 'data:image/png;base64,fakedata';

    // Avoid early return
    comp.selectedUser = user;
    comp.avatarFile = file;
    comp.user = user;

    userSpy.uploadAvatar.and.returnValue(of({avatar: result}));

    comp.saveEdit();
    expect(userSpy.uploadAvatar).toHaveBeenCalledWith('u3', file);
    expect(user.avatar).toBe(result);
    expect(comp.avatarSrc).toBe(result);
    expect(comp.errMsg).toBe('')
  })
});



