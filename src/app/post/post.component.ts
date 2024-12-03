import { Component, Input, OnInit } from '@angular/core';
import { CommentText, Post, User } from '../../models';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PostService } from '../post.service';
import { MatDialog } from '@angular/material/dialog';
import { CommentsDialogComponent } from '../comments/comments.component';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, FormsModule,MatFormFieldModule, MatSelectModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit {
sharePost(post: Post) {

  this.postService.sharePost(post._id!, this.user._id!);
}
  source: 'feed' | 'profile' = 'feed';

  user!: User;
  commentOnPost(arg0: number | undefined) {

  }

  dislikePost(postId: number, source: 'feed' | 'profile') {
    this.postService.dislikePost(postId, source);
    if (this.checkIfUserLikedPost(this.post)) {
      this.unlikePost(postId, source);
    }

  }
  
  checkIfUserLikedPost(post: Post) {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (!post.likes) return false;
    const liked = post.likes?.some(like => like.user?._id === user._id);

    return liked;
  }

  checkIfUserDislikedPost(post: Post) {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
   if (!post.dislikes) return false;
    const disliked = post.dislikes!.some(dislike => dislike.user?._id === user._id);

    return disliked;
  }
  likePost(postId: number, source: 'feed' | 'profile') {
    this.postService.likePost(postId, source);
    if (this.checkIfUserDislikedPost(this.post)) {
      this.undislikePost(postId, source);
    }
  }

  unlikePost(postId: number, source: 'feed' | 'profile') {
    this.postService.unlikePost(postId, source);
  }

  totalComments(comments: CommentText[]): number {
    //account for replies
    let total = comments.length;
    console.log('Total comments:', total);
    
    comments.forEach(comment => {
      total += comment.replies.length;
      console.log('total added:', total);
      
    });
    return total;
  }

  undislikePost(postId: number, source: 'feed' | 'profile') {
    this.postService.undislikePost(postId, source);
  }
  @Input() post!: Post;

  constructor(private postService: PostService, private dialog: MatDialog, private activatedRoute: ActivatedRoute) {

    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  openCommentsDialog(post: Post): void {
    this.dialog.open(CommentsDialogComponent, {
      width: '500px', // Dialog width
      data: { comments: this.postService.commentsSubject.value, postId: post._id, source: this.source },
      
      // Pass the comments
    });
  }


  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const postId = params['postId'];
      if (postId) {
        this.source = 'profile';
        this.postService.getPost(postId);
        setTimeout(() => {
          this.post = this.postService.viewedPostSubject.value!;
          console.log('Post:', this.post);
          console.log("Comment subject:", this.postService.commentsSubject.value);
        }, 500);

      }

    });
    console.log('Post input:', this.post);
    
    


  }
  isAdmin: boolean = false;

  checkAdminAccess(): boolean {
    // Replace this with a secure role check mechanism
    return localStorage.getItem('role') === 'admin';
  }

  deletePost(postId: number, source: 'feed' | 'profile') {
    this.postService.deletePost(postId, source);
  }

 
  editMode: boolean = false; // Track edit mode

  // Other existing code...

  editPost(post: Post): void {
    this.editMode = true; // Enable edit mode
  }

  savePost(post: Post): void {
    this.editMode = false; // Save changes and exit edit mode
    // Add save logic here
    this.postService.savePost(post);
  }

}



