import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';
import { User, Membership } from '../../interface';
import { AuthService } from '../../services/auth.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  let currentUser$: BehaviorSubject<User | null>;
  let membership$: BehaviorSubject<Membership | null>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    currentUser$ = new BehaviorSubject<User | null>(null);
    membership$ = new BehaviorSubject<Membership | null>(null);

    authSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['logout'], 
      {           
        currentUser$: currentUser$.asObservable(),
        membership$: membership$.asObservable(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy }
      ],
    })
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('userRole$ is admin when membership.role is admin', async() => {
    membership$.next({
      role: 'admin',
      _id: '',
      admin: '',
      groups: []
    });
    const role = await firstValueFrom(component.userRole$.pipe(skip(0)));
    expect(role).toBe('admin');
  });

  it('userRole$ should default to chatuser when membership is null', (done) => {
    component.userRole$.subscribe(role => {
      expect(role).toBe('chatuser');
      done();
    });
  });

  it('should call logout and navigate to /login', () => {
    spyOn(router, 'navigate');

    const event = { preventDefault: jasmine.createSpy() };
    component.logout(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(authSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });


});
