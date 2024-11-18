import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  profileImage: string | null = null; // Profile image can be null initially
  bio: string = 'This is my bio...';
  followersCount: number = 320;
  followingCount: number = 180;
  postsCount: number = 10;


  editProfile() {
    console.log('Edit profile clicked');
    // Implement edit profile logic here
  }

  openSettings() {
    console.log('Settings clicked');
    // Implement settings logic here
  }


  userName = 'John Doe';
  userBio = 'A short bio about the user.';
  userEmail = 'johndoe@example.com';
  userLocation = 'Lebanon';



  // Example data, you can replace it with dynamic data from a service
  username = 'John Doe';
  email = 'johndoe@example.com';
  numberOfFriends = 150;
  numberOfPosts = 10;
  posts = [
    { imageUrl: 'path_to_post_image1.jpg' },
    { imageUrl: 'path_to_post_image2.jpg' },
    { imageUrl: 'path_to_post_image3.jpg' }
  ];

}
