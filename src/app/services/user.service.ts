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

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.server}/api/fetchuserbyID/${id}`);
  }

  updateUserRole(newRole: string, userId: string, groupId: string): Observable<UpdatedUserRole> {
    return this.http.put<UpdatedUserRole>(`${this.server}/api/updateuser/${userId}`, { newRole, groupId });
  }

  addGroupToUser(approverId: string, applierId: string, groupId: string, notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.server}/api/addgrouptouser`, { approverId, applierId, groupId, notificationId });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deleteuser/${id}`);
  } 

  removeUserFromGroup(userId: string, groupId: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/removeuserfromgroup$`, { params: { userId, groupId }});
  }

  banUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.server}/api/banuserbyID/${id}`, {});
  }

  unBanUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.server}/api/unbanuserbyID/${id}`, {});
  }
}
