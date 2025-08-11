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
     
  
  
}
