import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-liked',
  standalone: true,
  imports: [  NavbarComponent ],
  templateUrl: './liked.component.html',
  styleUrl: './liked.component.css'
})
export class LikedComponent implements OnInit {
  likedPosts = [
    { title: 'Post 1', content: 'This is the content of liked post 1.' },
    { title: 'Post 2', content: 'This is the content of liked post 2.' },
    // Add more posts or fetch from a service
  ];

  constructor() { }

  ngOnInit(): void {
    // Fetch liked posts if needed
  }
}
