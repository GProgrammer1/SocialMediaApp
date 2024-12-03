import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../post.service';
import { Observable } from 'rxjs';
import { CommentText, User } from '../../models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comments-dialog',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
  imports: [MatFormField, MatLabel, MatInputModule, FormsModule, CommonModule, MatIconModule],
  standalone: true,
})
export class CommentsDialogComponent {

  newComment: string = '';
  comments$: Observable<CommentText[]> | undefined;
  source: 'feed' | 'profile' = 'feed';

  user: User = JSON.parse(sessionStorage.getItem('user') || '{}');
  constructor(
    public dialogRef: MatDialogRef<CommentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { comments: any[], postId: number, source: 'feed' | 'profile' }, private postService: PostService
  ) {

    this.comments$ = this.postService.comments$; 
  }

  replies: { [key: string]: string } = {};

addReply(commentId: number, replyText: string) {
  if (!replyText) return; // Ignore empty replies
  // Emit or send reply to the backend
  this.postService.addComment(this.data.postId, replyText, this.user._id!,  commentId, this.source);
  this.replies[commentId] = ''; // Clear input field
}

  // Close the dialog
  close(): void {
    this.dialogRef.close();
  }

  // Add a comment to the list
  addComment(): void {
    const userId = JSON.parse(sessionStorage.getItem('user') || '{}')._id;
    if (this.newComment.trim()) {
      this.postService.addComment(this.data.postId, this.newComment, userId, null, this.source);
      
      this.newComment = ''; // Clear the input
    }
  }

  deleteComment(commentId: number, source: 'feed' | 'profile'): void {
    this.postService.deleteComment(this.data.postId, commentId, source);
  }

  ngOnInit() {
    console.log('Post ID: ', this.data.postId);
    this.source = this.data.source;
    this.postService.getComments(this.data.postId);
  }

  


}
