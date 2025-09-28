import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router'; 
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { User } from '../../interface';
import { of } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let f: any;

  beforeEach(async () => {
    f = { invalid: false, reset: jasmine.createSpy('reset'), resetForm: jasmine.createSpy('resetForm') } as unknown as NgForm;
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser', 'setCurrentUser', 'login']);
  
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy}
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Test ngOnInit
  it('should display login when no user', () => {
    authSpy.getCurrentUser.and.returnValue(null);
    spyOn(console, 'log');

    fixture.detectChanges();
    expect(component.errMsg).toBe('');
    expect(authSpy.getCurrentUser).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('No user logged in, redirecting to login page.');
    expect(router.navigate).not.toHaveBeenCalled();
  })

  it('should navigate to account page when user is logged', () => {
    const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
    authSpy.getCurrentUser.and.returnValue(currentUser);

    fixture.detectChanges();
    expect(component.errMsg).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/account']);
  });

  // Test login
  it('should return if form is invalid', () => {
    f.invalid = true;
    component.errMsg = 'some perior error';

    component.login(f);

    expect(component.errMsg).toBe('');
    expect(component.submitted).toBe(true);
    expect(authSpy.login).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to account page, set current user on success', () => {
    const currentUser: User = { _id: 'u1', username: 'tom', pwd: '1234', email: 'tom@com', groups: ['g1', 'g3'], valid: true, avatar: '', isSuper: false };
    authSpy.login.and.returnValue(of(currentUser));
    f.invalid = false;
    spyOn(console, 'log');

    component.username = 'tom';
    component.pwd = '1234';
    component.rememberMe = true;

    component.login(f);

    expect(component.submitted).toBe(true);
    expect(authSpy.login).toHaveBeenCalledWith('tom', '1234');
    expect(authSpy.setCurrentUser).toHaveBeenCalledWith(currentUser, true);
    expect(router.navigate).toHaveBeenCalledWith(['/account'])
    expect(console.log).toHaveBeenCalledWith('Login request completed');
    expect(component.errMsg).toBe('');
  });
});
