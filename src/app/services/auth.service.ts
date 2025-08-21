import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interface';
import { map, distinctUntilChanged } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private http = inject(HttpClient);
  private server = 'http://localhost:3000';
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  // Handy derived streams
  currentUserId$: Observable<string | null> = this.currentUser$.pipe(
    map(u => (u?.id != null ? u.id.toString() : null)),
    distinctUntilChanged()
  );
  username$: Observable<string | null> = this.currentUser$.pipe(
    map(u => (u ? u.username.charAt(0).toUpperCase() + u.username.slice(1) : null)),
    distinctUntilChanged()
  );

  login(username: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + '/api/login', { username: username, pwd: pwd });
  }

  register(username: string, email: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + '/api/register', { username: username, email: email, pwd: pwd });
  }
     
  setCurrentUser(newuser: User): void {
    localStorage.setItem('currentUser', JSON.stringify(newuser));
    this.currentUserSubject.next(newuser);
  }

  getCurrentUser(): User | null {
    // const currentUser = localStorage.getItem('currentUser')
    // if (currentUser) {
    //   return JSON.parse(currentUser) as User;
    // }
    // return null;
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user ? true : false;
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
  }
}
