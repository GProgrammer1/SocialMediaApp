import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { SuggestedComponent } from '../suggested/suggested.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models';
import { AsyncPipe } from '@angular/common';
import { UserService } from '../user.service';
import { CommunicatorService } from '../communicator.service';
import { FriendRequestService } from '../friend-request.service';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
  imports: [MatDialogModule, SuggestedComponent, AsyncPipe],
  standalone: true,
})
export class FriendsListComponent {
  user: User = JSON.parse(sessionStorage.getItem('user') || '{}');
friendsSubject!: BehaviorSubject<User[]>;
friends$!: Observable<User[]>;
  constructor(
    public dialogRef: MatDialogRef<FriendsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { friends: any[] 
      
    }, private userService: UserService, private communicatorService: CommunicatorService, private friendRequestService: FriendRequestService
  ) {
    this.friendsSubject = this.communicatorService.friendsSubject;
  this.friends$ = this.friendsSubject.asObservable();
  }
  
mostActiveUser() { //the one with the most number of likes, comments and dislikes

  const mostActive = this.friendsSubject.value.reduce((mostActive, friend) => {
    let activity = friend.likes!.length + friend.dislikes.length + friend.comments!.length;
    if (activity > mostActive.activity) {
      mostActive = { friend, activity };
    }
    return mostActive;
  }, { friend: this.friendsSubject.value[0], activity: 0 });

  return mostActive.friend;

}

 

  get friends() {
    return this.data.friends;
  }
  removeFriend(friendId: number) {

    
    // this.userService.unfriend(this.user._id!, friendId).subscribe(
    //   {
    //     next: (response) => {
    //       console.log('Response:', response);
    //       this.friendsSubject.next(this.friendsSubject.value.filter((friend) => friend._id !== friendId));
    //       console.log('Friends:', this.friendsSubject.value);
          
    //       this.communicatorService.friendsSubject.next(this.friendsSubject.value);
    //       const updatedUser = { ...this.user, friends: this.friendsSubject.value };
    //       sessionStorage.setItem('user', JSON.stringify(updatedUser));
    //     },
    //     error: (error) => {
    //       console.error('Error:', error);
           
    //     }

    //   }
    // );
    this.friendRequestService.unfriend(friendId, this.user._id!);
  }

  close() { 
    this.dialogRef.close({friends: this.friendsSubject.value});
  }
}
      
