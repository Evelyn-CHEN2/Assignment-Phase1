import { Component } from '@angular/core';
import { Users} from '../users/users';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Admins } from "../admins/admins";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  
}