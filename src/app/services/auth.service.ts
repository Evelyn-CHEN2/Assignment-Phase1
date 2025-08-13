import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private server = 'http://localhost:3000';

  login(username: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + '/api/login', { username: username, pwd: pwd });
  }

  register(username: string, email: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + '/api/register', { username: username, email: email, pwd: pwd });
  }
     
  setCurrentUser(newuser: User): void {
    localStorage.setItem('currentUser', JSON.stringify(newuser));
  }

  getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      return JSON.parse(currentUser) as User;
    }
    return null;
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user ? true : false;
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
  }
}
