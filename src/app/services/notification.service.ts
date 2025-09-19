import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BanReport, Notification } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient)
  private server = 'http://localhost:3000';

  createNotification(userId: string, groupId: string): Observable<Notification> {
    return this.http.post<Notification>(this.server + '/api/createnotification', { userId, groupId });
  }

  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.server + '/api/fetchnotifications');
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deletenotification/${id}`);
  }

  fetchBanReports(): Observable<BanReport[]>{
    return this.http.get<BanReport[]>(this.server + '/api/fetchallreports')
  }

}
