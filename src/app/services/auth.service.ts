import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private server = 'http://localhost:3000';

  login(u_name: string, pwd: string): Observable<User> {
    return this.http.post<User>(this.server + 'api/login', { username: u_name, password: pwd });
  }
     
  setCurrentUser(newuser: User): void {
    localStorage.setItem('currentUser', JSON.stringify(newuser));
  }

  getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
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
    this.router.navigate(['/login']);
  }
}
