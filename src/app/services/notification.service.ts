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

  createNotification(userId: number, groupId: string, groupCreatorId: number): Observable<Notification> {
    return this.http.post<Notification>(this.server + '/api/createnotification', { userId, groupId, groupCreatorId });
  }

  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.server + '/api/fetchnotifications');
  }

  updateNotification(id: string): Observable<void> {
    return this.http.put<void>(`${this.server}/api/updatenotification/${id}`, {});
  }
}
