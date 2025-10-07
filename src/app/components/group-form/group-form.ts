import { Component, inject } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-form',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './group-form.html',
  styleUrl: './group-form.css'
})
export class GroupForm {
  user: User | null = null;
  submitted = false;
  groupname: string = ''; 
  description: string = '';
  channelnames: string = '';
  errMsg: string = '';

  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private router = inject(Router);

  onReset(f: NgForm): void {
    this.submitted = false;
    this.errMsg = '';
    f.resetForm();
  }
 
  // Create a new group
  createGroup(f: NgForm): void {
    this.errMsg = '';
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    // Only allow super or admin to create groups
    this.user = this.authService.getCurrentUser();

    if(!this.user) {
      this.errMsg = 'User information is missing. Please log in again.';
      return;
    }
    const userId = this.user?._id;
    
    this.authService.fetchMembership(userId).subscribe(m => {
      if(!m && !this.user?.isSuper) {
        this.errMsg = 'You do not have permission to create groups!';
        return
      }
      
      const groupName = this.groupname.trim();
      const description = this.description.trim();
      // (this.channelnames ?? '') ensures channelnames to be string when its null, for testing
      const channelNames = (this.channelnames ?? '').split(/[\r?\n,;]+/)
        .map(cname => cname.trim().replace(/^[,;]+|[,;]+$/g, ''))
        .filter(c => c.length > 0);

      if (!groupName || !description || channelNames.length === 0) {
        this.errMsg = 'Please enter one channel name per line.';
        return;
      }
      // Call the group service to create the group

      this.groupService.createGroup(groupName, description, channelNames, userId).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/groups']);
          this.onReset(f);
        }, 
        error: (err: any) => {
          console.error('Error creating group:', err);
          this.errMsg = err.error?.error || 'An error occurred while creating a group.';
        },
        complete: () => {
          console.log('Group created successfully.');
        }
    })
  });

  }
}
