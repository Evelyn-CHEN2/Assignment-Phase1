import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, switchMap, of } from 'rxjs';
import { User, Membership } from '../interface';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private http = inject(HttpClient);
  private server = 'http://localhost:3000';

  private currentUserSubject = new BehaviorSubject<User | null>(this.readFromStorage());
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable()

  login(username: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + '/api/login', { username: username, pwd: pwd });
  }

  register(username: string, email: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + '/api/register', { username: username, email: email, pwd: pwd });
  }

  private membershipSubject = new Subject<void>();
  membership$: Observable<Membership | null> = this.membershipSubject.pipe(
    switchMap(() => {
      const user = this.currentUserSubject.value;
      return user ? this.fetchMembership(user._id) : of(null);
    })
  );

  fetchMembership(userId: string): Observable<Membership> {
    return this.http.get<Membership>(this.server + '/api/fetchmembership', { params: { userId } });
  }

  refreshMembership(): void {
    this.membershipSubject.next(); 
  }
     
  setCurrentUser(newuser: User | null, remember = true): void {
    const key = 'currentUser';
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    if (remember) {
      localStorage.setItem('currentUser', JSON.stringify(newuser));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(newuser));
    }
    this.currentUserSubject.next(newuser);
  }

  private readFromStorage(): User | null {
    const user = localStorage.getItem('currentUser') ?? sessionStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user) as User;
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user ? true : false;
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
