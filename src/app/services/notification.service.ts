import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interface';
import { Notification } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient)
  private server = 'http://localhost:3000';

  createNotification(userId: number, groupId: string): Observable<void> {
    return this.http.post<void>(this.server + '/api/createnotification', { userId, groupId });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.server + '/api/getnotifications/');
  }

  updateNotification(id: string): Observable<void> {
    return this.http.put<void>(`${this.server}/api/updatenotification/${id}`, {});
  }
}
