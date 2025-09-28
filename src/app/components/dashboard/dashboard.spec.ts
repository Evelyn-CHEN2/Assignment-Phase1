import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { AuthService } from '../../services/auth.service';
import { User, Membership } from '../../interface';
import { of } from 'rxjs';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let authSpy: jasmine.SpyObj<AuthService>;
  const user1: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
  const user2: User = { _id: 'u2', username: 'eve', pwd: '1234', email: 'eve@com', groups: ['g1'], valid: true, avatar: '', isSuper: false };
  const membership: Membership = { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g3'] }

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'fetchMembership']);

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Set default return value
    authSpy.getCurrentUser.and.returnValue(null);
    authSpy.fetchMembership.and.returnValue(of(null));
    
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Test ngOnInit
  it('should get user information and set role to admin', () => {
    authSpy.getCurrentUser.and.returnValue(user1);
    authSpy.fetchMembership.and.returnValue(of(membership));

    fixture.detectChanges();
    expect(authSpy.fetchMembership).toHaveBeenCalledWith('u1');
    expect(component.userRole).toBe('admin')
  });

  it('should set role to chatuser when no membership', () => {
    authSpy.getCurrentUser.and.returnValue(user2);
    authSpy.fetchMembership.and.returnValue(of(null));

    fixture.detectChanges();
    expect(authSpy.fetchMembership).toHaveBeenCalledWith('u2');
    expect(component.userRole).toBe('chatuser')
  })
});
