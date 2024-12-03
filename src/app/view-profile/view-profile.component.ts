import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Post, User } from '../../models';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { FriendRequestService } from '../friend-request.service';
import { MatDialog } from '@angular/material/dialog';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { CommunicatorService } from '../communicator.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css'],
  standalone: true,
  imports: [NavbarComponent, CommonModule]
})
export class ViewProfileComponent implements OnInit {


  onViewProfile(id: number) {
    this.route.navigate(['/view-profile'], { queryParams: { userId: id } });
  }
  onDeclineFriend(user: User) {
    this.friendRequestService.removeFriendRequest(this.selfUser.friendRequests!.find((req) => req.sender._id === user._id)!._id!);
  }
  onRemoveFriendRequest(user: User) {
    this.friendRequestService.removeFriendRequest(this.selfUser.friendRequests!.find((req) => req.receiver._id === user._id)!._id!);
  }
  onAcceptFriend(user: User) {
    this.friendRequestService.acceptFriendRequest(this.selfUser.friendRequests!.find((req) => req.sender._id === user._id)!._id!, this.selfUser._id!);
  }

  onAddFriend(user: User) {
    this.friendRequestService.sendFriendRequest(this.selfUser._id!, user._id!);
  }

  userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  selfUser$!: Observable<User>;
  selfUser: User = JSON.parse(sessionStorage.getItem('user') || '{}');

  post!: Post;
  dialogOpen: boolean = false;

  constructor(private router: ActivatedRoute, private userService: UserService, private route: Router,
    private friendRequestService: FriendRequestService,
    private dialog: MatDialog,
    private communicatorService: CommunicatorService
  ) {
    this.selfUser$ = this.friendRequestService.selfUser$;
  }

  ngOnInit(): void {
    this.router.queryParams.subscribe(params => {
      const userId = params['userId'];
      console.log("User ID: ", userId);

      this.userService.getUser(userId).subscribe((data: any) => {
        const user = data.user;
        console.log("User: ", user);

        this.userSubject.next(user);

      });
    });

    this.selfUser$.subscribe((user) => {
      this.selfUser = user;
    }

    );

  }

  onRemoveFriend(user: User): void {
    this.friendRequestService.unfriend(user._id!, this.selfUser._id!);
  }

  checkFriendStatus(user: User): string {
    if (this.selfUser.friends?.some((friend) => friend._id === user._id)) return 'friends';
    if (this.selfUser.friendRequests?.some((req) => req.receiver._id === user._id)) return 'pending';
    if (this.selfUser.friendRequests?.some((req) => req.sender._id === user._id)) return 'accept';
    return 'add';
  }

  openPost(post: Post) {
    this.route.navigate(['/post'], { queryParams: { postId: post._id } });
  }

  openFriendsList() {

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

}
