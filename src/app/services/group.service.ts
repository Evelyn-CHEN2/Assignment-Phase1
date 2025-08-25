import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface';
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
    return this.http.get<Channel[]>(this.server + '/api/allchannels')
  }

  // getChannelUsers(id: string): Observable<User[]> {
  //   return this.http.get<User[]>(this.server + '/api/channelusers');
  // }

  createGroup(groupname: string, description: string , channelNames: string[], currentUser: User): Observable<Group> {
    return this.http.post<Group>(this.server + '/api/creategroup', { groupname, description, channelNames, currentUser });
  }

  addGroupToUser(groupId: string, userId: number): Observable<void> {
    return this.http.post<void>(`${this.server}/api/addgrouptouser`, { groupId, userId });
  }
  
  editGroup(group: Group): Observable<Group> {
    return this.http.put<Group>(`${this.server}/api/editgroup/${group.id}`, group);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deletegroup/${id}`);
  }

  deleteGroupFromUser(groupId: string, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deletegroupfromuser`, { params: { groupId, userId } });
  }

  createChannel(group: Group, channelName: string): Observable<Channel> {
    return this.http.post<Channel>(this.server + '/api/createchannel', { group, channelName });
  }

  deleteChannel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/api/deletechannel/${id}`);
  }

  addMsgToChannel(channelId: string, userId: number, text: string): Observable<Channel> {
    return this.http.post<Channel>(this.server + '/api/addmessage', { channelId, userId, text });
  }
}
