import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models';
import { UserService } from '../user.service';
import { FriendRequestService } from '../friend-request.service';
import { Router } from '@angular/router';
import { CommunicatorService } from '../communicator.service';

@Component({
  selector: 'app-suggested',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './suggested.component.html',
  styleUrl: './suggested.component.css'
})
export class SuggestedComponent implements OnInit {
onViewProfile(id: number) {
  this.router.navigate(['/view-profile'], {queryParams: {userId: id}});
}
onDeclineFriend(user: User) {
  this.friendRequestService.removeFriendRequest(this.selfUser.friendRequests!.find((req) => req.sender._id === user._id)!._id!);
}
onRemoveFriendRequest(user: User) {
   this.friendRequestService.removeFriendRequest(this.selfUser.friendRequests!.find((req) => req.receiver._id === user._id)!._id!);         
}
onAcceptFriend(user: User) {
  this.friendRequestService.acceptFriendRequest(this.selfUser.friendRequests!.find((req) => req.sender._id === user._id)!._id!, this.selfUser._id!);
  this.communicatorService.suggestedFriendsSubject.next(this.communicatorService.suggestedFriendsSubject.value.filter((friend) => friend._id !== user._id));
}

selfUser$!: Observable<User>;
selfUser: User = JSON.parse(sessionStorage.getItem('user') || '{}');
  onAddFriend(user: User) {
    this.friendRequestService.sendFriendRequest(this.selfUser._id!, user._id!);
  }

  suggestedFriends$!:Observable<User[]>;
  
  user!: User ;
  constructor(private userService: UserService, private friendRequestService: FriendRequestService,
    private router: Router, private communicatorService: CommunicatorService
  ) { 
    this.selfUser$ = this.friendRequestService.selfUser$;
   this.suggestedFriends$ = communicatorService.suggestedFriends$;
  }
  addFriend(friendId: number) {
    this.friendRequestService.sendFriendRequest(this.user._id!, friendId);
  }

  checkFriendStatus(user: User): string {

    console.log("Self user:", this.selfUser);
    console.log("User:", user);

    if (this.selfUser.friends?.some((friend) => friend._id === user._id)) return 'friends';
    if (this.selfUser.friendRequests?.some((req) => req.receiver._id === user._id)) return 'pending';
    if (this.selfUser.friendRequests?.some((req) => req.sender._id === user._id)) return 'accept';
    return 'add';
    
  }

  checkIfFriend(user: User): boolean {
    return this.selfUser.friends!.some((friend) => friend._id === user._id);
  }

  ngOnInit(): void {
    this.userService.suggestFriends(this.selfUser._id!).subscribe((response: any) => {
      const friends = response.suggestedFriends;
      console.log('Suggested friends:', friends);
      this.communicatorService.suggestedFriendsSubject.next(friends);
    });

    this.selfUser$.subscribe((user) => {
      this.selfUser = user;
    }

    );
  }
}
