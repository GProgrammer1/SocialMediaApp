import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule, NavbarComponent]
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

}
