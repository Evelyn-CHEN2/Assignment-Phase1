import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { GroupForm } from './group-form';
import { NgForm } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { Membership, User, Group } from '../../interface';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';


describe('GroupForm', () => {
  let component: GroupForm;
  let fixture: ComponentFixture<GroupForm>;
  
  let groupSpy: jasmine.SpyObj<GroupService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let f: any;

  const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
  const membership: Membership | null = { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g3'] };

  beforeEach(async () => {
    f = { invalid: false, reset: jasmine.createSpy('reset'), resetForm: jasmine.createSpy('resetForm') } as unknown as NgForm;
    groupSpy = jasmine.createSpyObj<GroupService>('GroupService', ['createGroup']);
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'fetchMembership']);
    routerSpy = jasmine.createSpyObj<Router>('Route', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GroupForm],
      providers: [
        provideHttpClient(),
        { provide: GroupService, useValue:groupSpy },
        { provide: AuthService, useValue:authSpy },
        { provide: Router, useValue:routerSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Test createGroup
  it('should return if form is invalid', () => {
    f.invalid = true;
    component.createGroup(f);

    expect(component.errMsg).toBe('');
    expect(groupSpy.createGroup).not.toHaveBeenCalled();
  });

  it('should set error if user is missing', () => {
    authSpy.getCurrentUser.and.returnValue(null);

    component.createGroup(f);

    expect(component.errMsg).toBe('User information is missing. Please log in again.');
    expect(groupSpy.createGroup).not.toHaveBeenCalled();
  })

  it('should set error if not admin or super', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    authSpy.fetchMembership.and.returnValue(of(null));

    component.createGroup(f);

    expect(component.errMsg).toBe('You do not have permission to create groups!');
    expect(groupSpy.createGroup).not.toHaveBeenCalled();
  })

  it('should set error if channel names parsing fails', fakeAsync(() => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    authSpy.fetchMembership.and.returnValue(of(membership));

    component.channelnames = '';
    component.createGroup(f);
    tick();
    expect(component.errMsg).toBe('Please enter one channel name per line.');

    // Reset and try null case
    component.errMsg = '';
    component.channelnames = (null as any);
    component.createGroup(f);
    tick();
    expect(component.errMsg).toBe('Please enter one channel name per line.');
  }));

  it('should create group, navigate to /dashboard/groups', () => {
    spyOn(console, 'log');
    authSpy.getCurrentUser.and.returnValue(currentUser);
    authSpy.fetchMembership.and.returnValue(of(membership));
 
    // Form values for the component to read
    component.groupname = 'test4';
    component.description = 'test4';
    component.channelnames = 'channel14\nchannel15';

    const newGroup: Group = { _id: 'g4', groupname: 'test4', description: 'test4', channels: ['c14', 'c15'], createdBy: '' };
    groupSpy.createGroup.and.returnValue(of(newGroup));
    component.createGroup(f);

    expect(groupSpy.createGroup).toHaveBeenCalledWith('test4', 'test4', ['channel14', 'channel15'], currentUser._id);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/groups']);
    expect(console.log).toHaveBeenCalledWith('Group created successfully.')
  })

  it('should set errMsg on error response', () => {
    authSpy.getCurrentUser.and.returnValue(currentUser);
    authSpy.fetchMembership.and.returnValue(of(membership));

    // Form values for the component to read
    component.groupname = 'test4';
    component.description = 'test4';
    component.channelnames = 'channel14\nchannel15';

    const errorResponse = { error: { error: 'Group creation failed' } };
    groupSpy.createGroup.and.returnValue(throwError(() => errorResponse));
    spyOn(console, 'error');

    component.createGroup(f);

    expect(console.error).toHaveBeenCalledWith('Error creating group:', errorResponse);
    expect(component.errMsg).toBe('Group creation failed');
  });
});


