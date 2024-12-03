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
import { Post, User } from '../../models';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { CommunicatorService } from '../communicator.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, MatMenuModule, RouterLink, MatDialogModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profilePicture$!: Observable<string>// Null if no custom picture is set
  bio$! : Observable<string>// Null if no bio is set
  posts$!: Observable<Post[]> ;// Empty array if no posts are made
  user!: User; 
  dialogOpen = false; 
  profileSubject! : BehaviorSubject<User>;
  profile$! : Observable<User>;
  friends$! : Observable<User[]>;
  isLoading= true;
  constructor(private dialog: MatDialog, private userService: UserService, private router: Router, private communicatorService: CommunicatorService,
    
  ) {
  
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.bio$ = this.communicatorService.bio$;
    this.profilePicture$ = this.communicatorService.profilePicture$;
    this.posts$ = this.communicatorService.posts$;
    this.friends$ = this.communicatorService.friends$;

    
  }

  editProfile() {
    console.log('Edit profile clicked');
    // Implement edit profile logic here
  }

  ngOnInit(): void {
    this.isLoading = true ;
    console.log("User: ", this.user);

    setTimeout(() => {
    this.communicatorService.bioSubject.next(this.user.bio!);
    this.communicatorService.profilePictureSubject.next(this.user.profilePic!);
    this.communicatorService.postsSubject.next(this.user.posts!);
    //sort friends by top number of posts and shared content
     this.communicatorService.friendsSubject.next(this.user.friends!.sort((a, b) => {
      return b.posts!.length  - a.posts!.length;
    }
    ));

      const state = this.router.getCurrentNavigation()?.extras.state as { updated: boolean };
      if (state?.updated) {
        this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.profileSubject.next(this.user);
      }
      this.isLoading = false;
    }, 2000);

  }

  sortPostsByCreatedTime(posts: Post[]) {
    console.log("Posts tobe sorted method trigerredddddddddddddddddddddd");
    
    posts=  posts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    console.log('Sorted posts:', posts);
    return posts;
    
  }

  getProfilePicture() {
    this.userService.getProfilePicture(this.user._id!).subscribe(
      {
        next: (response: any)=> {
          const url = response.profilePic ;
          if (!url) {
            this.profileSubject.next({...this.user, profilePic: ''});
            return;
          }
          this.profileSubject.next({...this.user, profilePic: url});

        },
        error: (error: any) => {
          console.log(error);
          this.profileSubject.next({...this.user, profilePic: ''});
        }
      });


  }

  openSettings() {
    console.log('Settings clicked');
    // Implement settings logic here
  }



  
  openFriendsList() {
  //   this.friends$.subscribe((friends) => {
  //  const dialogRef = this.dialog.open(FriendsListComponent, {
  //     disableClose: true,
  //     data: { friends: friends },
  //     width: '500px'
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('The dialog was closed');
  //     console.log('Result:', result);
  //     friends = result.friends;
  //   });
  // });
  
    if (!this.dialogOpen) {
      this.dialogOpen = true;
      const dialogRef = this.dialog.open(FriendsListComponent, {
        data: { friends: this.communicatorService.friendsSubject.value },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        this.dialogOpen = false; // Reset dialog open state
        if (result?.friends) {
          this.communicatorService.friendsSubject.next(result.friends);
        }
      });
    }
  

    
  }

  openPost(post: Post) {
    this.router.navigate(['/post'], {queryParams: {postId: post._id}});
  }

}
