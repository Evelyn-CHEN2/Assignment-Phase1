import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { chatMsg } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class ChatmessageService {
  private http = inject(HttpClient);
  private server = 'http://localhost:3000';

  fetchMsgsByChannelId(id: string): Observable<chatMsg[]> {
    return this.http.get<chatMsg[]>(`${this.server}/api/fetchchatmessages/${id}`)
  }
}
