import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, MatMenuModule,NavbarComponent,RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {


  userName = 'John Doe';
  userBio = 'A short bio about the user.';
  userEmail = 'johndoe@example.com';
  userLocation = 'Lebanon';


  // Example data, you can replace it with dynamic data from a service
  username = 'John Doe';
  email = 'johndoe@example.com';
  bio = 'This is the bio section. Here is where you can write something about yourself!';
  numberOfFriends = 150;
  numberOfPosts = 10;
  posts = [
    { imageUrl: 'path_to_post_image1.jpg' },
    { imageUrl: 'path_to_post_image2.jpg' },
    { imageUrl: 'path_to_post_image3.jpg' }
  ];

}
