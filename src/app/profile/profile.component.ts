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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, MatMenuModule, RouterLink, MatDialogModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profilePicture: string | null = null; // Null if no custom picture is set
  bio: string | null = null; // Null if no bio is set
    posts: Post[] = []; 
  user!: User; 

  profileSubject! : BehaviorSubject<User>;
  profile$! : Observable<User>;
  friends: User[] = [];
  constructor(private dialog: MatDialog, private userService: UserService, private router: Router) {
  
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.profileSubject = new BehaviorSubject<User>(this.user);
    this.profile$ = this.profileSubject.asObservable();
  }

  editProfile() {
    console.log('Edit profile clicked');
    // Implement edit profile logic here
  }

  ngOnInit(): void {
    console.log("User: ", this.user);
    
      this.profileSubject.subscribe((user: User) => {
        console.log('User:', user);
        
        this.profilePicture = user.profilePic!;
        this.posts = user.posts!;
        this.bio = user.bio!;
        this.friends = user.friends!;
      

      });
      const state = this.router.getCurrentNavigation()?.extras.state as { updated: boolean };
      if (state?.updated) {
        this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.profileSubject.next(this.user);
      }


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
    this.dialog.open(FriendsListComponent, {
      data: { friends: this.friends },
      width: '400px'
    });
  }

}
