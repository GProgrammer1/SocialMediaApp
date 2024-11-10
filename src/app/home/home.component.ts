import { Component } from '@angular/core';
import { HomeStoryComponent } from "../home-story/home-story.component";
import { HomePostComponent } from "../home-post/home-post.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeStoryComponent, HomePostComponent, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent { }
