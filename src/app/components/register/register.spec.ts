import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Register } from './register';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { User } from '../../interface';
import { of } from 'rxjs';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let f: any;
  let router: Router;

  beforeEach(async () => {
    f = { invalid: false, reset: jasmine.createSpy('reset'), resetForm: jasmine.createSpy('resetForm') } as unknown as NgForm;
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['setCurrentUser', 'register']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy}
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return if form is invalid', () => {
    f.invalid = true;

    component.register(f);

    expect(component.errMsg).toBe('');
    expect(component.submitted).toBe(true);
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('should create a new user and set current user', () => {
    f.invalid = false;
    const newUser: any = {
      _id: 'u11',
      username: 'Herry',
      email: 'herry@com'
    };
    authSpy.register.and.returnValue(of(newUser));
    spyOn(console, 'log');

    component.username = 'Herry';
    component.email = 'herry@com';
    component.pwd = '1234';

    component.register(f);

    expect(component.submitted).toBe(true);
    expect(authSpy.register).toHaveBeenCalledWith('Herry', 'herry@com', '1234');
    expect(authSpy.setCurrentUser).toHaveBeenCalledWith(newUser);
    expect(router.navigate).toHaveBeenCalledWith(['/account']);
    expect(console.log).toHaveBeenCalledWith('Registration request completed.');
    expect(component.errMsg).toBe('');
  });
});
