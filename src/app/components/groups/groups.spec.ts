import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Groups } from './groups';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { Channel, Group, Membership, User, Notification } from '../../interface';
import { of } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

describe('Groups', () => {
  let component: Groups;
  let fixture: ComponentFixture<Groups>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let groupSpy: jasmine.SpyObj<GroupService>;
  let userSpy: jasmine.SpyObj<UserService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
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
  const channels: Channel[] = [
    { _id: 'c11', channelname: 'channel1', groupId: 'g1', chatMsg: [] }, 
    { _id: 'c12', channelname: 'channel2', groupId: 'g1', chatMsg: [] },
    { _id: 'c13', channelname: 'channel3', groupId: 'g3', chatMsg: [] },
  ];
  const membership: Membership = { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g3'] }
  const event: any = { preventDefault: jasmine.createSpy('preventDefault')};

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'fetchMembership', 'setCurrentUser']);
    groupSpy = jasmine.createSpyObj<GroupService>('GroupService', ['getGroups', 'getChannels', 'leaveGroup', 'editGroup', 'deleteGroup', 'deleteChannel', 'createChannel']);
    userSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers', 'deleteUser', 'uploadAvatar']);
    notificationSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['createNotification'])

    await TestBed.configureTestingModule({
      imports: [Groups],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: authSpy },
        { provide: GroupService, useValue: groupSpy },
        { provide: UserService, useValue: userSpy },
        { provide: NotificationService, useValue: notificationSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Groups);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Test ngOnInit
  it('should get user information from services', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    groupSpy.getGroups.and.returnValue(of(allGroups));
    groupSpy.getChannels.and.returnValue(of(channels));
    userSpy.getUsers.and.returnValue(of(allUsers));
    authSpy.fetchMembership.and.returnValue(of(membership));

    fixture.detectChanges();
    expect(component.user).toEqual(allUsers[0]);
    expect(component.userById['u1']).toBe('Tom');
    expect(component.formattedGroups.map(g => g._id)).toEqual(['g1', 'g2', 'g3']);
    expect(component.adminGroups.map(g=>g._id)).toEqual(['g1', 'g3']);
    expect(component.membership).toBe(membership);
    expect(component.errMsg).toBe('');
  });

  // Test sortGroups
  it('should sort groups alphabetically', () => {
    component.errMsg = 'some perior error';
    component.groups = [
      { _id: 'g1', groupname: 'Data' } as any,
      { _id: 'g2', groupname: 'Beta' } as any,
      { _id: 'g3', groupname: 'AI' } as any,
    ]
    component.sortAsc = true;

    component.sortGroups();

    expect(component.groups.map(g => g._id)).toEqual(['g3', 'g2', 'g1']);
    expect(component.sortAsc).toBe(false);
    expect(component.errMsg).toBe('');
  });

  // Test showAdminGroups
  it('should display admin groups', () => {
    component.errMsg = 'some perior error';
    component.adminGroups = [
      { _id: 'g1', groupname: 'A1test', description: 'test1', channels: [], createdBy: '' }, 
      { _id: 'g3', groupname: 'B1test', description: 'test3', channels: [], createdBy: '' }
    ]

    component.showAdminGroups();

    expect(component.adminGroupsActive).toBeTrue();
    expect(component.groups.map(g=>g._id)).toEqual(['g1', 'g3']);
    expect(component.errMsg).toBe('');
  });

    // Test showAllGroups
    it('should display all groups', () => {
      component.errMsg = 'some perior error';
      component.formattedGroups = [
        { _id: 'g1', groupname: 'Data' } as any,
        { _id: 'g2', groupname: 'Beta' } as any,
        { _id: 'g3', groupname: 'AI' } as any,
      ]
      component.showAllGroups();
  
      expect(component.adminGroupsActive).toBeFalse();
      expect(component.groups.map(g=>g._id)).toEqual(['g1', 'g2', 'g3']);
      expect(component.errMsg).toBe('');
    });

    // Test toggleEditGroup
    it('should toggle edit group modal', () => {
      component.errMsg = 'some prior error';
      component.editGroup = null as any;
      const group: any = { _id: 'g1', groupname: 'Data' };
       
      component.toggleEditGroup(group, event);
  
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.editGroup).toEqual({...group});
      expect(component.errMsg).toBe('');
    });

    // Test saveEdit
    it('should return if editGroup null', () => {
      component.editGroup = null as any;

      component.saveEdit(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(groupSpy.editGroup).not.toHaveBeenCalled();
    });

    it('should save new group name on success and update UI', () => {
      component.errMsg = 'some prior error';
      component.groups = [
        { _id: 'g1', groupname: 'Data', description: '', channels: [], createdBy: '' } as any,
        { _id: 'g2', groupname: 'AI', description: '', channels: [], createdBy: '' } as any,
      ];
      component.editGroup = { _id: 'g1', groupname: 'Data2' } as any;
      const updatedGroup: Group = { _id: 'g1', groupname: 'Data2', description: '', channels: [], createdBy: '' };
      groupSpy.editGroup.and.returnValue(of(updatedGroup));
      spyOn(console, 'log');

      component.saveEdit(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(groupSpy.editGroup).toHaveBeenCalledWith('g1', 'Data2');
      expect(component.groups.find(g=>g._id)?.groupname).toBe('Data2');
      expect(component.errMsg).toBe('');
      expect(console.log).toHaveBeenCalledWith('Group edit request completed.');
    });

    // Test openDelete channel modal
    it('should toggle delete group modal', () => {
      component.errMsg = 'some prior error';
      component.selectedGroup = null as any;
      const group = { _id: 'g3', groupname: 'test3' } as any;

      component.openDeleteGroupModal(group);

      expect(component.errMsg).toBe('')
      expect(component.selectedGroup).toEqual(group);
    });

    // Test deleteGroup
    it('should delete a group', () => {
      groupSpy.deleteGroup.and.returnValue(of(void 0));
      spyOn(console, 'log');
      component.groups = [
        { _id: 'g1', groupname: 'Data', description: '', channels: [], createdBy: '' } as any,
        { _id: 'g2', groupname: 'AI', description: '', channels: [], createdBy: '' } as any,
        { _id: 'g3', groupname: 'Scie', description: '', channels: [], createdBy: '' } as any,
      ];
      component.adminGroups = [
        { _id: 'g1', groupname: 'Data', description: '', channels: [], createdBy: '' } as any,
        { _id: 'g2', groupname: 'AI', description: '', channels: [], createdBy: '' } as any,
      ];
      const toDelete = { _id: 'g2', groupname: 'AI', description: '', channels: [], createdBy: '' } as any;

      component.deleteGroup(toDelete, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(groupSpy.deleteGroup).toHaveBeenCalledWith('g2')
      expect(component.groups.map(g=>g._id)).toEqual(['g1', 'g3']);
      expect(component.adminGroups.map(g=>g._id)).toEqual(['g1']);
      expect(component.errMsg).toBe('');
      expect(console.log).toHaveBeenCalledWith('Group deletion request completed.');
    });

    // Test openDelete channel modal
    it('should toggle delete channel modal', () => {
      component.errMsg = 'some prior error';
      component.selectedChannel = null as any;
      const channel: Channel = { _id: 'c13', channelname: 'channel3', groupId: 'g3', chatMsg: [] };

      component.openDeleteChannelModal(channel);

      expect(component.errMsg).toBe('')
      expect(component.selectedChannel).toEqual(channel);
    });

    // Test deleteChannel
    it('should delete a channel from a group and update UI', () => {
      groupSpy.deleteChannel.and.returnValue(of(void 0));
      component.groups = [
        { _id: 'g1', groupname: 'test1', channels: [
          { _id: 'c11', groupId: 'g1'}, 
          { _id: 'c12', groupId: 'g3'}
        ] } as any,  
        { _id: 'g3', groupname: 'test3',channels: [
          { _id: 'c13', groupId: 'g3'}, 
          { _id: 'c14', groupId: 'g1'}
        ] } as any
      ];
      const toDelete: Channel = { _id: 'c13', channelname: 'channel3', groupId: 'g3', chatMsg: [] };

      component.deleteChannel(toDelete, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(groupSpy.deleteChannel).toHaveBeenCalledWith('c13');
      const group = component.groups.find(g=>g._id === 'g3') as any;
      expect(group.channels.map((c: any) => c._id)).toEqual(['c14']);
    });

    // Test confirmAddChannel
    it('should display errMsg when a channel is empty', () => {
      const newChannel: Channel = { _id: 'c14', channelname: 'channel4', groupId: 'g1', chatMsg: [] };
      groupSpy.createChannel.and.returnValue(of(newChannel))

      const group = { _id: 'g1', groupname: 'test1', channels: [
        { _id: 'c11', groupId: 'g1'}, 
        { _id: 'c12', groupId: 'g3'}
      ] } as any;
      component.newChannelName['g1'] = '';

      component.confirmAddChannel(group, event);

      expect(groupSpy.createChannel).not.toHaveBeenCalled();
      expect(component.errMsg).toBe('Channel name is required.');
    });

    it('should add a channel to the group on success and update UI', () => {
      const newChannel: Channel = { _id: 'c14', channelname: 'channel4', groupId: 'g1', chatMsg: [] };
      groupSpy.createChannel.and.returnValue(of(newChannel));
      spyOn(console, 'log');

      const group = { _id: 'g1', groupname: 'test1', channels: [
        { _id: 'c11', groupId: 'g1'}, 
        { _id: 'c12', groupId: 'g3'}
      ] } as any;
      component.newChannelName['g1'] = 'channel4';

      component.confirmAddChannel(group, event);

      expect(groupSpy.createChannel).toHaveBeenCalledWith('g1', 'channel4');
      expect(group.channels.map((c:Channel)=> c._id)).toEqual(['c11', 'c12','c14']);
      expect(component.newChannelName['g1']).toBe('');
      expect(component.errMsg).toBe('');
      expect(console.log).toHaveBeenCalledWith('Channel creation request completed.');
    });

    // Test applyToJoinGroup
    it('should displau errMsg if user id not defined', () => {
      component.errMsg = 'some perior errors';
      const group = { _id: 'g1', groupname: 'test1', channels: [
        { _id: 'c11', groupId: 'g1'}, 
        { _id: 'c12', groupId: 'g3'}
      ] } as any;
      component.user = null as any;

      component.applyToJoinGroup(group, event);

      expect(component.errMsg).toBe('User ID is required to send a notification.');
      expect(event.preventDefault).toHaveBeenCalled();
      expect(notificationSpy.createNotification).not.toHaveBeenCalled();
    });

    it('should create a notification after using apyyling yo join a group', () => {
      component.errMsg = 'some perior errors';
      component.user = { _id: 'u8', groups: []} as any;
      const group = { _id: 'g1', groupname: 'test1', channels: [
        { _id: 'c11', groupId: 'g1'}, 
        { _id: 'c12', groupId: 'g3'}
      ] } as any;

      const newNotification: Notification = {
        _id: 'n1', applier: 'u8', groupToApply: 'g1', status: 'pending', approvedBy: '', timestamp: new Date('2025-01-01T00:00:00Z')
      }
      notificationSpy.createNotification.and.returnValue(of(newNotification));
      component.applyPending = {} as any;
      spyOn(window, 'alert');
      spyOn(console, 'log');

      component.applyToJoinGroup(group, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(notificationSpy.createNotification).toHaveBeenCalledWith('u8', 'g1');
      expect(window.alert).toHaveBeenCalledWith('Application sent. Please wait for admin approval.');
      expect(component.applyPending['g1']).toBeTrue();
      expect(console.log).toHaveBeenCalledWith('Application request completed.');
      expect(component.errMsg).toBe('');
    })
});

