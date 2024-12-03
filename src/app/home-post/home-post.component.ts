import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Observable } from 'rxjs';
import { Notification, Post } from '../../models';
import { AsyncPipe, CommonModule } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommunicatorService } from '../communicator.service';

@Component({
  selector: 'app-home-post',
  standalone: true,
  imports: [AsyncPipe, PostComponent, MatIconModule, MatMenuModule, CommonModule],
  templateUrl: './home-post.component.html',
  styleUrl: './home-post.component.css'
})
export class HomePostComponent implements OnInit {
posts$!: Observable<Post[]>;
notifications$! : Observable<Notification[]>;

  constructor(private postService: PostService, private communicatorService: CommunicatorService) {
    this.posts$ = this.postService.posts$;
    this.notifications$ = this.communicatorService.notifications$;
  }


 ngOnInit(): void {
    this.postService.loadPosts();
    setTimeout(() => {
    console.log("Posts loaded: " , this.postService.postsSubject.value);
    }, 3000);

 }


markAsRead(notification: any): void {
  // Logic to mark notification as read
  notification.read = true;
  // Optionally, remove it from the list
}

numOfUnreadNotifications(): number {
  console.log("Notifications: ", this.communicatorService.notificationsSubject.value);

  return this.communicatorService.notificationsSubject.value.filter((n) => n.isRead === false).length;
}
}
