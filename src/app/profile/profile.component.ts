import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  userName = 'John Doe';
  userBio = 'A short bio about the user.';
  userEmail = 'johndoe@example.com';
  userLocation = 'Lebanon';
}
