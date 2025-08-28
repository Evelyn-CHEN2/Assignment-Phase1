import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UpdatedUserRole } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private server = 'http://localhost:3000';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.server + '/api/fetchallusers')
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.server}/api/fetchuserbyID/${id}`);
  }

  updateUserRole(newRole: string, userId: number, groupId: string): Observable<UpdatedUserRole> {
    return this.http.put<UpdatedUserRole>(`${this.server}/api/updateuser/${userId}`, { newRole, groupId });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deleteuser/${id}`);
  } 
}
