import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SuggestedComponent } from '../suggested/suggested.component';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { FriendRequest, User } from '../../models';
import { CommunicatorService } from '../communicator.service';
import { UserService } from '../user.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendRequestService } from '../friend-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SuggestedComponent, MatIconModule, AsyncPipe, CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
onViewProfile(id: number) {
  this.router.navigate(['/view-profile'], {queryParams: {userId: id}});

}
  selfUser$! : Observable<User>; 
  
  searchQuery: string = '';
  searchResults$!: Observable<User[]>;
  selfUser: User = JSON.parse(sessionStorage.getItem('user') || '{}');

  constructor(
    private communicatorService: CommunicatorService,
    private userService: UserService,
    private friendRequestService: FriendRequestService,
    private router: Router
  ) {
    this.searchResults$ = this.communicatorService.searchResults$;
    this.selfUser$ = this.friendRequestService.selfUser$;
  }

  ngOnInit(): void {
    // Self-user state automatically updates
    this.selfUser$.subscribe((user) => {
      this.selfUser = user;
    });
  }

  viewProfile(user: User): void {
  }
  
  checkFriendStatus(user: User): string {
    if (this.selfUser.friends?.some((friend) => friend._id === user._id)) return 'friends';
    if (this.selfUser.friendRequests?.some((req) => req.receiver._id === user._id)) return 'pending';
    if (this.selfUser.friendRequests?.some((req) => req.sender._id === user._id)) return 'accept';
    return 'add';
  }
    checkIfFriend(user: User): boolean{
      return this.selfUser.friends!.some((friend) => friend._id === user._id);

  }
  

  onSearch(): void {
    console.log("Search Query:", this.searchQuery);
    this.userService.searchUsers(this.searchQuery).subscribe((response:  any) => {
      const users = response.users;
      console.log("Search Results:", users);
      this.communicatorService.searchResultsSubject.next(users.filter((user: User) => user._id !== this.selfUser._id));
    });
  }

  // checkIfFriend(user: User): string {
  //   console.log("Self User:", this.selfUser, "User:", user);

  //   console.log("Friends:", this.selfUser.friends);
  //   console.log('User ID:', user._id);
    
    
  //   if (this.selfUser.friends?.some(friend => friend._id === user._id)) {
  //     console.log("Status: FRIENDS");
  //     return 'friends';
  //   }

  //   if (this.selfUser.friendRequests?.some(req => req.receiver._id === user._id)) {
  //     console.log("Status: PENDING");
  //     return 'pending';
  //   }

  //   if (this.selfUser.friendRequests?.some(req => req.sender._id === user._id)) {
  //     console.log("Status: ACCEPT");
  //     return 'accept';
  //   }

  //   console.log("Status: ADD");
  //   return 'add';
  // }

  onAddFriend(user: User): void {
    console.log("User to be added:", user);
    
    this.friendRequestService.sendFriendRequest(this.selfUser._id!, user._id!);
    // this.userService.befriend(this.selfUser._id!, user._id!).subscribe((response: any)=> {
    //   const updatedUser = {
    //     ...this.selfUser,
    //     friendRequests: [...(this.selfUser.friendRequests || []), response.friendRequest]
    //   };
    //   this.updateUserState(updatedUser);
    //   this.updateSearchResults(user, 'pending');
    // });
    setTimeout(() => {
    this.updateUserState(this.friendRequestService.selfUserSubject.value);
    },500);
    

  }

  

  onRemoveFriend(user: User): void {
   
    this.friendRequestService.unfriend(user._id!, this.selfUser._id!);
    
  }

  onAcceptFriend(user: User): void {
    const friendRequest = this.getFriendRequest(user, 'sender'); //get the friend request sent by the user to be accepted

    console.log("Friend Request to be accepted:", friendRequest);
    
    this.friendRequestService.acceptFriendRequest(friendRequest!._id!, this.selfUser._id!);

    // setTimeout(() => {
    //   this.updateUserState(this.friendRequestService.selfUserSubject.value);
    // }
    // ,500);
  }

 

  onDeclineFriend(user: User): void {
    const friendRequest = this.getFriendRequest(user, 'sender');
    // if (!friendRequest) return;

    // this.userService.deleteFriendRequest(friendRequest._id!).subscribe(() => {
    //   const updatedRequests = this.selfUser.friendRequests?.filter(req => req._id !== friendRequest._id);
    //   const updatedUser = { ...this.selfUser, friendRequests: updatedRequests };
    //   this.updateUserState(updatedUser);
    //   // this.updateSearchResults(user, 'add');
    // });
    this.friendRequestService.removeFriendRequest(friendRequest!._id!);

    // setTimeout(() => {
    //   this.updateUserState(this.friendRequestService.selfUserSubject.value);
    // }
    // ,500);
  }

  onRemoveFriendRequest(user: User): void {
    const friendRequest = this.getFriendRequest(user, 'receiver');
    console.log("Friend Request to be removed:", friendRequest);
    
    this.friendRequestService.removeFriendRequest(friendRequest!._id!);

    // setTimeout(() => {
    //   this.updateUserState(this.friendRequestService.selfUserSubject.value);
    // }
    // ,500);
    // console.log("Onremove method reached");
    
    // const friendRequest = this.getFriendRequest(user, 'receiver');
    // console.log("Friend Request:", friendRequest);
    
    // if (!friendRequest) return;

    // this.userService.deleteFriendRequest(friendRequest._id!).subscribe((response : any)=> {
    //   console.log('Method reached for deleting friedn request', response);
      
      
    //   const updatedRequests = this.selfUser.friendRequests?.filter(req => req._id !== response.friendRequest);
    //   console.log("Updated Requests:", updatedRequests);
      
    //   const updatedUser = { ...this.selfUser, friendRequests: updatedRequests };
    //   console.log("Updated User:", updatedUser);
      
    //   this.updateUserState(updatedUser);
    // });
  }

  

  private updateUserState(updatedUser: User): void {
    this.selfUser = updatedUser;
    sessionStorage.setItem('user', JSON.stringify(updatedUser)); // Restored sessionStorage update
  }

  private getFriendRequest(user: User, role: 'sender' | 'receiver') {
    console.log("Self User:", this.selfUser);
    
    return this.selfUser.friendRequests?.find(req => req[role]._id === user._id);
  }
}
