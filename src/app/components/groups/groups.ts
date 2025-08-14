import { Component, inject, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { Group } from '../../interface';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class Groups {
  groups: Group[] = [];

  private groupService = inject (GroupService)

  ngOnInit(): void {
    forkJoin({
      groups: this.groupService.getGroups(),
      allchannels: this.groupService.getChannels(),
    }).subscribe(({ groups, allchannels }) => {
      this.groups = groups.map(group => {
        return {
          ...group,
          channels: allchannels.filter(channel => channel.groupid === group.id)
        };
      });
      console.log('All groups fetched successfully:', this.groups);
    })
  }

}
