import { Component } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';

@Component({
  selector: 'app-group-form',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './group-form.html',
  styleUrl: './group-form.css'
})
export class GroupForm {
  submitted = false;

  createGroup(f: NgForm, event: any): void {
    event.preventDefault();
    this.submitted = true;
  }
}
