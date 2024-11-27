import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css'],
  standalone: true,
  imports: [NavbarComponent]
})
export class ViewProfileComponent {
  profilePicture: string | null = null; // Null if no custom picture is set
  friendName = 'Jane Doe';
  friendEmail = 'janedoe@example.com';
  numberOfPosts = 12;
  numberOfFriends = 250;
  friendBio = 'Avid reader, traveler, and tech enthusiast.';
  friendPosts = [
    { imageUrl: 'assets/post1.jpg' },
    { imageUrl: 'assets/post2.jpg' },
    { imageUrl: 'assets/post3.jpg' },
  ];
}
