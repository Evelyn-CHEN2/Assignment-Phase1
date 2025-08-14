import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../interface';
import { Channel } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient)
  private server = 'http://localhost:3000';

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.server + '/api/allgroups')
  }

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.server + '/api/channels')
  }

  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(this.server + '/api/creategroup', group);
  }

  createChannel(channel: Channel): Observable<Channel> {
    return this.http.post<Channel>(this.server + '/api/createchannel', channel);
  }

  updateGroup(group: Group): Observable<Group> {
    return this.http.put<Group>(`${this.server}/api/updategroup/${group.id}`, group);
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deletegroup/${id}`);
  }

  deleteChannel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deletechannel/${id}`);
  }
}
