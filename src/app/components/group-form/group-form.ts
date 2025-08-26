import { Component, inject } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { Channel } from '../../interface';
import { Group } from '../../interface';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-group-form',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './group-form.html',
  styleUrl: './group-form.css'
})
export class GroupForm {
  submitted = false;
  groupname: string = ''; 
  description: string = '';
  channelnames: string = '';
  errMsg: string = '';
  testname: string = 'test';

  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private router = inject(Router);

  onReset(f: NgForm): void {
    this.submitted = false;
    f.resetForm();
  }
 
  // Create a new group
  createGroup(f: NgForm): void {
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    const channelNames = this.channelnames.split(/[\r?\n,;]+/)
      .map(cname => cname.trim().replace(/^[,;]+|[,;]+$/g, ''))
      .filter(c => c.length > 0);

    if (!Array.isArray(channelNames)) {
      this.errMsg = 'Please enter one channel name per line.';
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No current user found. Cannot create group.');
      return;
    }
    // Only let admin and super to create groups
    if (currentUser.role.includes('admin') && currentUser.role.includes('super')) {
      this.errMsg = 'You do not have permission to create groups.';
      return;
    }
    this.groupService.createGroup(this.groupname, this.description, channelNames, currentUser).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/groups']);
        this.onReset(f);
        this.errMsg = '';
        this.submitted = false;
      }, 
      error: (error: any) => {
        console.error('Error creating group:', error);
        this.errMsg = error.error?.error;
      },
      complete: () => {
        console.log('Group created successfully.');
      }
    })

  }
}
