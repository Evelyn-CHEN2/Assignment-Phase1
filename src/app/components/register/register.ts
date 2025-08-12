import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  submitted = false;
  username: string = '';
  email: string ='';
  pwd: string = '';
  groups: string[] = [];
  errMsg: string = '';
  private authService = inject(AuthService);
  
  onSubmit(f: NgForm) {
    this.submitted = true;
    if (f.invalid) {
      return;
    }
    // Here you would typically handle the form submission
    console.log('Register form submitted:', f.value);
    // Reset the form after submission
    f.reset();

  }
}
