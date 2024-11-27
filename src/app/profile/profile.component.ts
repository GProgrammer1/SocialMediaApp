import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, MatMenuModule, RouterLink, MatDialogModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  profilePicture: string | null = null; // Null if no custom picture is set
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

  friends = [
    { name: 'John Doe', email: 'john@example.com', profilePicture: 'assets/john-pic.jpeg' },
    { name: 'Jane Smith', email: 'jane@example.com', profilePicture: null },
    // Add more friends as needed
  ];

  constructor(private dialog: MatDialog) {}

  openFriendsList() {
    this.dialog.open(FriendsListComponent, {
      data: { friends: this.friends },
      width: '500px'
    });
  }

}
