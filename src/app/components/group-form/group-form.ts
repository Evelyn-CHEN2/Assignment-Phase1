import { Component, inject } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { Channel } from '../../interface';
import { Group } from '../../interface';
import { Router } from '@angular/router';

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
    this.groupService.createGroup(this.groupname, this.description, channelNames, currentUser).subscribe({
      next: () => {
        console.log('Group created successfully'); 
        this.router.navigate(['/dashboard/groups']);
        // Reset form fields after successful creation
        this.onReset(f);
      }
    })


  }
}
