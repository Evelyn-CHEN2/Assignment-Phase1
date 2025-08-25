import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private server = 'http://localhost:3000';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.server + '/api/fetchusers')
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.server}/api/fetchuserbyID/${id}`);
  }

  updateUserRole(newRole: string, id: number): Observable<User> {
    return this.http.put<User>(`${this.server}/api/updateuser/${id}`, {newRole});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deleteuser/${id}`);
  } 
}
