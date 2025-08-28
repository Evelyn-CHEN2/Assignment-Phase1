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
    // Only allow super or admin to create groups
    this.user = this.authService.getCurrentUser();
    if (this.user?.role !== 'admin' && this.user?.role !== 'super') {
      this.errMsg = 'You do not have permission to create groups!';
      return;
    }
    const channelNames = this.channelnames.split(/[\r?\n,;]+/)
      .map(cname => cname.trim().replace(/^[,;]+|[,;]+$/g, ''))
      .filter(c => c.length > 0);

    if (!Array.isArray(channelNames)) {
      this.errMsg = 'Please enter one channel name per line.';
      return;
    }
    // Call the group service to create the group
    this.groupService.createGroup(this.groupname, this.description, channelNames, this.user).subscribe({
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
