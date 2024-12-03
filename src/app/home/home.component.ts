import { Component, OnInit } from '@angular/core';
import { HomePostComponent } from "../home-post/home-post.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { SocketService } from '../socket.service';
import { HomeStoryComponent } from '../home-story/home-story.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeStoryComponent, HomePostComponent, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private socketService : SocketService) { }

  ngOnInit(): void {
    this.socketService.connect();
  }
 }
