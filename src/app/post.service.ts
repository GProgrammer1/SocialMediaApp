import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { SocketService } from './socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommentText, Post, User } from '../models';
import { Router } from '@angular/router';
import { CommunicatorService } from './communicator.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  postsSubject = new BehaviorSubject<Post[]>([]);
  actionSource : 'feed' | 'profile' = 'feed';
  posts$ = this.postsSubject.asObservable();
  viewedPostSubject = new BehaviorSubject<Post | null>(null);
  commentsSubject = new BehaviorSubject<CommentText[]>([]); 
  comments$ = this.commentsSubject.asObservable();

  createPost(post: FormData) {
    return this.http.post('http://localhost:3000/post/create', post);
  }

  socket! : Socket;
  
  constructor(private http: HttpClient, private socketService: SocketService, private router: Router, private communicatorService: CommunicatorService)  { 
    this.socket = io('http://localhost:4000/posts', {
      auth: { userId: JSON.parse(sessionStorage.getItem('user') || '{}')._id }
    });

    this.socket.on('connect', () => {
      console.log('Connected to post server');
    });

    this.socket.on('error', (error) => {
      console.error('Error connecting to post server:', error);
    });

this.socket.on('commentsLoaded', ({postId, comments}) => {
  console.log('Comments:', comments);
  this.commentsSubject.next(comments);
}
);

this.socket.on('postSaved', (updatedPost:  Post) => {

  console.log('Post saved:', updatedPost);
  this.postsSubject.next(this.postsSubject.value.map(post => post._id === updatedPost._id ? updatedPost : post));
  const user : User= JSON.parse(sessionStorage.getItem('user') || '{}');
  const updatedUser = {...user, posts: user.posts!.map(post => post._id === updatedPost._id ? updatedPost : post)};
  this.updateUserState(updatedUser);
  console.log('Post saved:', updatedPost);
  

}
);


    this.socket.on('commentAdded', ({postId, comment}) => {
      console.log('Comment added:', comment);

      console.log("Source:", this.actionSource);
      
      let posts : Post[];
      let post : Post = {} as Post;

      if(this.actionSource === 'feed') {
        posts = this.postsSubject.value;

        console.log("Posts in postsSubject:", posts);
        
        
        post = posts.find(post => post._id === postId)!;
        console.log("Post in postsSubject:", post);
        
        console.log("Post comments in postsSubject before adding:", post.comments);
        
        if (post) {
          
          if (!comment.parent) {
            post.comments!.push(comment);
            console.log("Post comments after adding rootless comment:", post.comments);
            
          }
          else {
            const parentComment = post.comments!.find(postComment => postComment._id === comment.parent);
            console.log('Parent comment:', parentComment);
            
            parentComment!.replies.push(comment);
            console.log('Parent comment with reply:', parentComment);
            console.log('Post with reply:', post);
            
            
          }
          console.log("Post comments in postsSubject after adding:", post.comments);
          
          this.postsSubject.next([...posts]);
          this.commentsSubject.next([...post.comments!]);
          console.log('Post with comment:', post);
        }
      } else {
        post = this.viewedPostSubject.value!;
        console.log('Post in viewsubject:', post);
        
        if (post) {

          if (!comment.parent) {
            post.comments!.push(comment);
            console.log("Post comments after adding rootless comment:", post.comments);
            
          }
          else {
            const parentComment = post.comments!.find(postComment => postComment._id === comment.parent);
            console.log('Parent comment:', parentComment);
            parentComment!.replies.push(comment);
            console.log('Parent comment with reply:', parentComment);
            console.log('Post with reply:', post);
          }
         
          this.viewedPostSubject.next(post);
          this.commentsSubject.next([...post.comments! ]);
          console.log('Post with comment:', post);
        }
      }
    });

    this.socket.on('new-notification', (notification) => {
      console.log('New notification:', notification);
      communicatorService.notificationsSubject.next([...communicatorService.notificationsSubject.value, notification]);  
    }
    );

    this.socket.on('postLiked', ({postId, userId, likeId}) => {
      console.log("Post liked listener triggered");
      console.log('PostId:', postId);
      
      
      let posts: Post[];
      let post: Post = {} as Post;

      if(this.actionSource === 'feed') {
        posts = this.postsSubject.value;
        post = posts.find(post => post._id === postId)!;
        console.log("Post in postsSubject:", post);
        
        if (post) {
          const user : User = JSON.parse(sessionStorage.getItem('user') || '{}');

          post.likes!.push({user: {...user}, postId, _id : likeId});
          this.postsSubject.next([...posts]);
          const updatedUser = {...user, likes: [...user.likes!, {user: {...user}, postId, _id : likeId}]};
          this.updateUserState(updatedUser);
          console.log('Post liked in postsSubject:', post);
        }
      } else {
        post = this.viewedPostSubject.value!;
        console.log('Post in viewsubject:', post);
        
        if (post) {
          const user = JSON.parse(sessionStorage.getItem('user') || '{}');
          post.likes!.push({user: {...user}, postId, _id : likeId});
          this.viewedPostSubject.next(post);
         console.log('Post liked in viewsubject:', post);
         
          const updatedUser = {...user, likes: [...user.likes!, {user: {...user}, postId, _id : likeId}]};
          this.updateUserState(updatedUser);
          console.log('Post liked in viewsubject:', post);
        }
      }
    });

    this.socket.on('postDisliked', ({postId, userId, dislikeId}) => {
      console.log("Post disliked listener triggered");
      
      let posts: Post[];
      let post: Post = {} as Post;
      const user : User= JSON.parse(sessionStorage.getItem('user') || '{}');
      if(this.actionSource === 'feed') {
        posts = this.postsSubject.value;
        post = posts.find(post => post._id === postId)!;
        console.log("Post in postsSubject:", post);
        
        if (post) {
          post.dislikes!.push({user: {...user}, postId, _id : dislikeId});
          this.postsSubject.next([...posts]);
          const updatedUser = {...user, dislikes: [...user.dislikes!, {user:{...user}, postId, _id : dislikeId}]};
          this.updateUserState(updatedUser);
          console.log('Post disliked:', post);
        }
      } else {
        post = this.viewedPostSubject.value!;
        console.log('Post in viewsubject:', post);
        
        if (post) {
          post.dislikes!.push({user: {...user}, postId, _id : dislikeId});
          this.viewedPostSubject.next(post);
          console.log('Post disliked:', post);
          
          const updatedUser = {...user, dislikes: [...user.dislikes!, {user: {...user}, postId, _id : dislikeId}]};
          this.updateUserState(updatedUser);
          console.log('Post disliked:', post);
        }
      }
    });

    this.socket.on('storySaved', (savedStory) => {
      console.log('Story saved:', savedStory);
      this.communicatorService.storySubject.next([...this.communicatorService.storySubject.value!, savedStory]);
    }
    );

    this.socket.on('storiesLoaded', (stories) => {

      console.log('Stories:', stories);
      this.communicatorService.storySubject.next(stories);
    }
    );
      

    this.socket.on('postUndisliked', ({postId, userId}) => {
      console.log("Post undisliked listener triggered");
      
     let posts: Post[];
     let post: Post = {} as Post;

     if(this.actionSource === 'feed') {
      posts = this.postsSubject.value;
      post = posts.find(post => post._id === postId)!;
      console.log("Post in postsSubject:", post);
      
      if (post) {
        post.dislikes = post.dislikes?.filter(dislike => dislike.user._id !== userId);
        this.postsSubject.next([...posts]);
        const user : User = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = {...user, dislikes: user.dislikes!.filter(dislike => dislike.postId !== postId)};
        this.updateUserState(updatedUser);
        console.log('Post undisliked:', post);
      }
     } else {

      post = this.viewedPostSubject.value!;
      console.log('Post in viewsubject:', post);
      
      if (post) {
        post.dislikes = post.dislikes?.filter(dislike => dislike.user._id !== userId);
        this.viewedPostSubject.next(post);
        console.log('Post undisliked:', post);
        
        const user : User = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = {...user, dislikes: user.dislikes!.filter(dislike => dislike.postId !== postId)};
        this.updateUserState(updatedUser);
        console.log('Post undisliked:', post);
      }
      }
    });

    this.socket.on('commentDeleted', ({postId, commentId}) => {
      console.log('Comment deleted:', commentId);
      let posts: Post[];
      let post: Post = {} as Post;

      if(this.actionSource === 'feed') {
        posts = this.postsSubject.value;
        post = posts.find(post => post._id === postId)!;
        console.log("Post in postsSubject:", post);
        
        if (post) {
          post.comments = post.comments?.filter(comment => comment._id !== commentId);
          this.postsSubject.next([...posts]);
          this.commentsSubject.next([...post.comments!]);
          console.log('Post with comment deleted:', post);
        }
      } else {
        post = this.viewedPostSubject.value!;
        console.log('Post in viewsubject:', post);
        
        if (post) {
          post.comments = post.comments?.filter(comment => comment._id !== commentId);
          this.viewedPostSubject.next(post);
          this.commentsSubject.next([...post.comments!]);
          console.log('Post with comment deleted:', post);
        }
      }
    });

    this.socket.on('postDeleted', (postId) => {
      console.log('Post deleted:', postId);
      let posts : Post[];
      let post : Post = {} as Post;
       if (this.actionSource === 'feed') {
        posts = this.postsSubject.value;
        post = posts.find(post => post._id === postId)!;
        console.log("Post in postsSubject:", post);
        
        if (post) {
          this.postsSubject.next(posts.filter(post => post._id !== postId));
          console.log('Post deleted:', post);
        }
    }
    else {
      post = this.viewedPostSubject.value!;
      console.log('Post in viewsubject:', post);
      
      if (post) {
        posts = this.postsSubject.value;
        console.log("Posts in postsSubject:", posts);
        
        this.viewedPostSubject.next(null);
        const user: User = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = {...user, posts: user.posts!.filter(post => post._id !== postId)};
        this.updateUserState(updatedUser);
        router.navigate(['/profile']);
        console.log('Post deleted:', post);
      }
    }
    }
    );

    this.socket.on('commentAddedStory', ({storyId, comment}) => {
      console.log('Comment added:', comment);
      const story = this.communicatorService.storySubject.value!.find(story => story._id === storyId)!;
      console.log('Story:', story);
      story.comments!.push(comment);
      this.communicatorService.storySubject.next([...this.communicatorService.storySubject.value!]);
    }
    );
    
    this.socket.on('postShared', (updatedPost) => {
      console.log('Post shared:', updatedPost);
      this.postsSubject.next([...this.postsSubject.value, updatedPost]);
    }
  );

    this.socket.on('postUnliked', ({postId, userId}) => {
      console.log("Post unliked listener triggered");
      let posts: Post[];
      let post: Post = {} as Post;
      if (this.actionSource === 'feed') {
       posts = this.postsSubject.value;
       post = posts.find(post => post._id === postId)!;
       console.log("Post in postsSubject:", post);
       
       if (post) {
        post.likes = post.likes?.filter(like => like.user._id !== userId);
        this.postsSubject.next([...posts]);
        console.log('Post unliked:', post);
        
        const user : User = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = {...user, likes: user.likes!.filter(like => like.postId !== postId)};
        this.updateUserState(updatedUser);
        console.log('Post unliked:', post);

      }
      } else {
        post = this.viewedPostSubject.value!; 
        console.log('Post in viewsubject:', post);   
        
        
        if (post) {
          post.likes = post.likes?.filter(like => like.user._id !== userId);
          this.viewedPostSubject.next(post);
          console.log('Post unliked:', post);


          
          const user : User = JSON.parse(sessionStorage.getItem('user') || '{}');
          const updatedUser = {...user, likes: user.likes!.filter(like => like.postId !== postId)};
          this.updateUserState(updatedUser);
          console.log('Post unliked:', post);
        }
      }
      
     
    }
    );


    this.socket.on('postsLoaded', (posts) => {
      console.log('Posts:', posts);
      this.postsSubject.next([...this.postsSubject.value, ...posts.posts]);
      

    });



  }

  getPost(postId: number) {
    this.http.get(`http://localhost:3000/post/${postId}`).subscribe((data: any) => {
      const post = data.post;
      this.viewedPostSubject.next(post);
    }
    );
  }

  loadStories() {
    const userId = JSON.parse(sessionStorage.getItem('user') || '{}')._id;
    this.socket.emit('loadStories',  {userId});
  }

  loadPosts() {
    const userId = JSON.parse(sessionStorage.getItem('user') || '{}')._id;
    this.socket.emit('loadPosts', {userId});
  }

  likePost(postId: number, source: 'feed' | 'profile') {
    console.log('Like post:', postId);
    this.actionSource = source;
    console.log('Action source:', this.actionSource);
    
    this.socket.emit('likePost', {postId, userId: JSON.parse(sessionStorage.getItem('user') || '{}')._id});
  }

  unlikePost(postId: number, source: 'feed' | 'profile') {
    console.log('Unlike post:', postId);
    this.actionSource = source;
    this.socket.emit('unlikePost', {postId, userId: JSON.parse(sessionStorage.getItem('user') || '{}')._id});
  }

  undislikePost(postId: number, source: 'feed' | 'profile') {
    console.log('Undislike post:', postId);
    this.actionSource = source;
    this.socket.emit('undislikePost', {postId, userId: JSON.parse(sessionStorage.getItem('user') || '{}')._id});
  }

  dislikePost(postId: number, source: 'feed' | 'profile') {
    console.log('Dislike post:', postId);
    this.actionSource = source;
    this.socket.emit('dislikePost', {postId, userId: JSON.parse(sessionStorage.getItem('user') || '{}')._id});
  }

  deleteComment(postId: number, commentId: number, source: 'feed' | 'profile') {
    console.log('Delete comment:', commentId);
    this.actionSource = source;
    this.socket.emit('deleteComment', {postId, commentId});
  }

  addComment(postId: number, commentText: string, userId: number, parentId: number | null, actionSource: 'feed' | 'profile') {
    console.log('Add comment:', postId, commentText);
    this.actionSource = actionSource;
    this.socket.emit('addComment', {postId, commentText, userId, parentId});
  }

  sharePost(postId: number, userId: number) {
    this.socket.emit('sharePost', {postId, userId});
  }

  updateUserState(updatedUser: User) {
    
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    sessionStorage.setItem('user', JSON.stringify(updatedUser));


  }

  //TODO: Implement delete post
  deletePost(postId: number, source: 'feed' | 'profile') {
    this.actionSource = source;
    this.socket.emit('deletePost', postId);
  }

  getComments(postId: number) {
    this.socket.emit('getComments', postId);
  }

  savePost(post: Post) {
    this.socket.emit('savePost', post);
  }

  uploadStory(fileData: ArrayBuffer, fileName: string, userId: number) {
    this.socket.emit('uploadStory', {fileData, fileName, userId});
  }
}
