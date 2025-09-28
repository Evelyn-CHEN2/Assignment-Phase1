import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Users } from './users';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { Group, UpdatedUserRole, User } from '../../interface';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let groupSpy: jasmine.SpyObj<GroupService>;
  let userSpy: jasmine.SpyObj<UserService>;

  const allUsers: User[] = [
    { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false },
    { _id: 'u2', username: 'jerry', pwd: '1234', email: 'jerry@com', groups: ['g1', 'g2'], valid: true, avatar: '', isSuper: false },
    { _id: 'u3', username: 'eve', pwd: '1234', email: 'eve@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false }
  ];

  const allGroups: any = [
    { _id: 'g1', groupname: 'test1', description: '', channels: ['c11', 'c12'], createdBy: '' }, 
    { _id: 'g2', groupname: 'test2', description: '', channels: [], createdBy: '' }, 
    { _id: 'g3', groupname: 'test3', description: '', channels: ['c13'], createdBy: '' }
  ];

  const event: any = { preventDefault: jasmine.createSpy('preventDefault')};

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'fetchMembership']);
    groupSpy = jasmine.createSpyObj<GroupService>('GroupService', ['getGroups']);
    userSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers', 'updateUserRole']);

    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: authSpy},
        { provide: GroupService, useValue: groupSpy},
        { provide: UserService, useValue: userSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Test ngOnInit
  it('should load all data for super', fakeAsync(() => {
    const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: true };
    authSpy.getCurrentUser.and.returnValue(currentUser);
    userSpy.getUsers.and.returnValue(of(allUsers));
    groupSpy.getGroups.and.returnValue(of(allGroups));
    authSpy.fetchMembership.and.callFake((id: string) => {
      if (id === 'u1') {
        return of({ _id: 'm1', role: 'super', admin: 'u1', groups: [] });
      }
      // return null membership
      return of(null);
    });

    fixture.detectChanges();
    tick();

    expect(component.users.map(u=>u._id)).toEqual(['u2', 'u3']);
    expect(component.userGroupsByUser['u2'].map(g=>g._id)).toEqual(['g1', 'g2']);
    expect(component.roleByGroupByUser['u2']['g1']).toBe('chatuser');
    expect(component.userRole).toBe('super');
    expect(component.errMsg).toBe('');
  }));

  it('should load filtered data for admin', fakeAsync(() => {
    const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
    authSpy.getCurrentUser.and.returnValue(currentUser);
    userSpy.getUsers.and.returnValue(of(allUsers));
    groupSpy.getGroups.and.returnValue(of(allGroups));
    authSpy.fetchMembership.and.callFake((id: string) => {
      if (id === 'u1') {
        return of({ _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g3'] });
      }
      // return null membership
      return of(null);
    });

    fixture.detectChanges();
    tick();

    expect(component.users.map(u=>u._id)).toEqual(['u2', 'u3']);
    expect(component.userGroupsByUser['u2'].map(g=>g._id)).toEqual(['g1']);
    expect(component.roleByGroupByUser['u2']['g1']).toBe('chatuser');
    expect(component.userRole).toBe('admin');
    expect(component.errMsg).toBe('');
  }));

  // Test updater user role
  it('should return if user or group null', () => {
    const user = (null as any);
    const group = (null as any);

    component.updateRole(user, group, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(userSpy.updateUserRole).not.toHaveBeenCalled();
  });

  it('should update user role and update UI', () => {
    const selectedUser: User = { _id: 'u1', username: 'eve', pwd: '', email: '', groups: [], valid: true, avatar: '', isSuper: false};
    const selectedGroup: Group = { _id: 'g1', groupname: 'test1', description: 'test1', channels: [], createdBy: '' };

    const key = `${selectedUser._id}: ${selectedGroup._id}`; 
    component.roleByGroupByUser = { 'u1': { 'g1': 'chatuser' }} as any;
    component.newRole = { [key]: 'admin'} as any;
    component.showUpdateRole = { [key]: true } as any;
    userSpy.updateUserRole.and.returnValue(
      of({ user: selectedUser, group: selectedGroup} as UpdatedUserRole)
    ); 
    spyOn(console, 'log');

    component.updateRole(selectedUser, selectedGroup, event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(userSpy.updateUserRole).toHaveBeenCalledWith('admin', 'u1', 'g1');
    expect(component.roleByGroupByUser['u1']['g1']).toBe('admin');
    expect(component.showUpdateRole[key]).toBe(false);
    expect(console.log).toHaveBeenCalledWith('User role update complete.');
  });
})
