import { Component } from '@angular/core';
import { User } from '../../interface';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  users: User[] = [];

}
