import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User, Channel, chatMsg } from'../../interface';
import { Chatwindow } from './chatwindow';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ChatmessageService } from '../../services/chatmessage.service';
import { SocketService } from '../../services/socket.service';

describe('Chatwindow', () => {
  let component: Chatwindow;
  let fixture: ComponentFixture<Chatwindow>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let groupSpy: jasmine.SpyObj<GroupService>;
  let userSpy: jasmine.SpyObj<UserService>;
  let chatMsgSpy: jasmine.SpyObj<ChatmessageService>;
  let socketSpy: jasmine.SpyObj<SocketService>;

  const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
  const allUsers: User[] = [
    { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false },
    { _id: 'u2', username: 'jerry', pwd: '1234', email: 'jerry@com', groups: ['g1', 'g2'], valid: true, avatar: '', isSuper: false },
    { _id: 'u3', username: 'eve', pwd: '1234', email: 'eve@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false }
  ];
  const channels: Channel[] = [
    { _id: 'c11', channelname: 'channel1', groupId: 'g1', chatMsg: [] }, 
    { _id: 'c12', channelname: 'channel2', groupId: 'g1', chatMsg: [] },
    { _id: 'c13', channelname: 'channel3', groupId: 'g3', chatMsg: [] },
  ];
  const channel: Channel = { _id: 'c11', channelname: 'channel1', groupId: 'g1', chatMsg: [] };
  const chatMsgs: chatMsg[] = [{ _id: 'm1', sender: 'u1', message: 'hi', channelId: 'c11', timestamp: new Date() }];
  const event: any = { preventDefault: jasmine.createSpy('preventDefault')};

  beforeEach(async () => {
    // Create mock services with methods
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'fetchMembership']);
    groupSpy = jasmine.createSpyObj('GroupService', ['getChannels']);
    userSpy = jasmine.createSpyObj('UserService', ['getUsers', 'banUser']);
    chatMsgSpy = jasmine.createSpyObj('ChatmessageService', ['fetchMsgsByChannelId']);
    socketSpy = jasmine.createSpyObj('SocketService', [
      'initSocket', 'joinChannel', 'reqUserNum',
      'onMessage', 'onNotices', 'onUserNum',
      'offUserNum', 'leaveChannel', 'sendMessage'
    ]);
    await TestBed.configureTestingModule({
      imports: [Chatwindow],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 'c11' }} }
        },
        { provide: AuthService, useValue: authSpy },
        { provide: GroupService, useValue: groupSpy },
        { provide: UserService, useValue: userSpy },
        { provide: ChatmessageService, useValue: chatMsgSpy },
        { provide: SocketService, useValue: socketSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chatwindow);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test ngOnInit
  it('should initialise socket and join channel', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    groupSpy.getChannels.and.returnValue(of(channels));
    userSpy.getUsers.and.returnValue(of(allUsers));
    chatMsgSpy.fetchMsgsByChannelId.and.returnValue(of(chatMsgs));
    authSpy.fetchMembership.and.returnValue(of({ _id: 'm1', role: 'admin' } as any));

    socketSpy.onMessage.and.callFake((cb: any) => cb({ _id: 'm2', sender: 'u1', message: 'test', timestamp: Date.now()}));
    socketSpy.onNotices.and.callFake((cb: any) => cb('System notice'));
    socketSpy.onUserNum.and.callFake((cb: any) => cb({ channelId: 'c11', userNum: 5}))

    fixture.detectChanges();

    expect(component.channelId).toBe('c11');
    expect(component.channel).toEqual(channel);
    expect(component.userById['u1']).toBe('Tom'); // First letter is capitalised
    expect(component.chatMessages.length).toBeGreaterThan(0);
    expect(component.userNum).toBe(5);

    expect(socketSpy.initSocket).toHaveBeenCalled();
    expect(socketSpy.joinChannel).toHaveBeenCalledWith('c11', 'tom');
    expect(socketSpy.reqUserNum).toHaveBeenCalledWith('c11');
  })

  // Test ngOnDestroy
  it('should clean up socket on destroy', () => {
    component.currentUser = currentUser;
    component.channelId = 'c11';

    component.ngOnDestroy();

    expect(socketSpy.offUserNum).toHaveBeenCalled();
    expect(socketSpy.leaveChannel).toHaveBeenCalledWith('c11', 'tom');
  })

  // Test sendMessage
  it('should show error when input message is empty', () => {
    component.message = ' ';
    component.currentUser = currentUser;
    component.channel = channel;

    component.sendMessage(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.errMsg).toBe('Message cannot be empty.');
    expect(socketSpy.sendMessage).not.toHaveBeenCalled();
  })

  it('should show error when user not found', () => {
    component.message = 'test message';
    component.currentUser = null;
    component.channel = channel;

    component.sendMessage(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.errMsg).toBe('User not found.');
    expect(socketSpy.sendMessage).not.toHaveBeenCalled();
  })

  it('should show error when channel not found', () => {
    component.message = 'test message';
    component.currentUser = currentUser;
    component.channel = null;

    component.sendMessage(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.errMsg).toBe('Channel not found.');
    expect(socketSpy.sendMessage).not.toHaveBeenCalled();
  })

  it('should emit message via socket and clean input on success', () => {
    component.message = '  test message. ';
    component.currentUser = currentUser;
    component.channel = channel;
    component.channelId = 'c11';

    component.sendMessage(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.errMsg).toBe('');
    expect(socketSpy.sendMessage).toHaveBeenCalledWith('c11', 'u1', 'test message.');
    expect(component.message).toBe('');
  })

  // Test confirmBan
  it('should ban user log success on next()', () => {
    userSpy.banUser.and.returnValue(of(void 0));
    spyOn(console, 'log');

    component.confirmBan('u1', 'c11', event);

    expect(userSpy.banUser).toHaveBeenCalledWith('u1', 'c11');
    expect(console.log).toHaveBeenCalledWith('User banned successfully.')
  })

  it('should set errMsg on error', () => {
    const errorResponse = {error: { error: 'Ban failed'}}
    userSpy.banUser.and.returnValue(throwError(() => errorResponse));
    spyOn(console, 'error');

    component.confirmBan('u1', 'c11', event);

    expect(userSpy.banUser).toHaveBeenCalledWith('u1', 'c11');
    expect(console.error).toHaveBeenCalledWith('Error banning user:', errorResponse);
    expect(component.errMsg).toBe('Ban failed');
  })
});
