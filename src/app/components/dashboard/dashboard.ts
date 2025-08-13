import { Component, inject } from '@angular/core';
import { User } from '../../interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  users: User[] = [];

  private userService = inject(UserService);

}
