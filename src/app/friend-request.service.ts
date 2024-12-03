import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { io, Socket } from 'socket.io-client';
import { CommunicatorService } from './communicator.service';
import { FriendRequest, User } from '../models';
import { BehaviorSubject } from 'rxjs';


//TODO: Fix search results update for friend request removed
//TODO: Fix search results update for friend removed
//TODO: Fix search results update for friend request accepted
@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private socket!: Socket;
  selfUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('user') || '{}'));
  selfUser$ = this.selfUserSubject.asObservable();

  constructor(
    private socketService: SocketService,
    private communicatorService: CommunicatorService
  ) {
    const userId = JSON.parse(sessionStorage.getItem('user') || '{}')._id;
    this.socket = io('http://localhost:4000/friend-requests', {
      auth: { userId },
    });

    this.socket.on('connect', () => console.log('Connected to friend request server'));
    this.socket.on('error', (error) => console.error('Error connecting to friend request server:', error));

    this.initializeSocketListeners();
  }

  private initializeSocketListeners() {
    this.socket.on('friend-request-sent', (friendRequest) => this.handleFriendRequest(friendRequest, 'add'));
    this.socket.on('friend-request-received', (friendRequest) =>{
      console.log("Friend request received listener triggered");
      this.handleFriendRequest(friendRequest, 'add');
    } );
    this.socket.on('friend-request-accepted', (request) => this.handleFriendAcceptance(request));
    this.socket.on('friend-request-removed', (request) => this.handleFriendDecline(request));
    this.socket.on('unfriended', ({ friendId, userId }) => this.handleUnfriend(friendId, userId));
    this.socket.on('new-notification', (notification) => {

      console.log("New notification listener triggered");
      this.communicatorService.notificationsSubject.next([...this.communicatorService.notificationsSubject.value, notification]);
  });
}

  private handleFriendRequest(friendRequest: FriendRequest, operation: 'add') {
    console.log("Friend request accepted listener triggered");
    
    const user = this.selfUserSubject.value; //get me the updated state of the user 
    const updatedUser = {
      ...user,
      friendRequests: [...(user.friendRequests || []), friendRequest],
    };
    this.updateUserState(updatedUser);

    // if (operation === 'add') {
    //   this.updateSearchResults(friendRequest.receiver, 'friendRequests', friendRequest, operation);
    // }
  }

  private handleFriendAcceptance(request: any) { //let's assume we're the sender
    console.log("Friend request accepted listener triggered");
    
    const user = this.selfUserSubject.value;
    console.log("User to be updated:", user);
    
    console.log("User friend requests:", user.friendRequests);
    console.log("Request Id:", request._id);
    
    
    // Update selfUser for the recipient
    const updatedUser = {
      ...user,
      friends: [...(user.friends || []), user._id === request.sender._id ? request.receiver : request.sender],
      friendRequests: user.friendRequests?.filter((req) => req._id !== request._id),
    };

    console.log("Updated user:", updatedUser);
    
    this.updateUserState(updatedUser);
  
    // Update search results for the recipient
    // this.updateSearchResults(request.sender, 'friends', request, 'accept');
  
    // Notify the sender to update their state
    // if (this.selfUserSubject.value._id === request.sender._id) {
    //   const updatedSender = {
    //     ...user,
    //     friends: [...(user.friends || []), request.receiver],
    //   };
    //   this.communicatorService.friendsSubject.next(updatedSender.friends || []);
    //   this.updateUserState(updatedSender);
    //   this.updateSearchResults(request.receiver, 'friends', request, 'accept');
    // }
  }
  

  private handleFriendDecline(request: any) {
    const user = this.selfUserSubject.value;
    console.log("User to be updated:", user);
    
    const updatedUser = {
      ...user,
      friendRequests: user.friendRequests?.filter((req) => req._id !== request._id),
    };
    console.log("Updated user:", updatedUser);
    
    this.updateUserState(updatedUser);
  }

  private handleUnfriend(friendId: string, userId: string) {
    console.log("Unfriend listener triggered");
    

    const user = this.selfUserSubject.value;
    if (user._id?.toString() !== friendId) {
    const updatedUser = {
      ...user,
      friends: user.friends?.filter((friend) => friend._id?.toString() !== friendId),
    };
    this.communicatorService.friendsSubject.next(updatedUser.friends || []);
    this.updateUserState(updatedUser);
    // this.updateSearchResults(updatedUser, 'friends', null, 'unfriend');
  }

  else {
    const updatedUser = {
      ...user,
      friends: user.friends?.filter((friend) => friend._id?.toString() !== userId),
    };
    this.updateUserState(updatedUser);
    // this.updateSearchResults(updatedUser, 'friends', null, 'unfriend');

  }
}
  sendFriendRequest(senderId: number, receiverId: number): void {
    this.socket.emit('send-friend-request', { senderId, receiverId });
  }

  removeFriendRequest(requestId: number): void {
    this.socket.emit('remove-friend-request', {requestId});
  }

  acceptFriendRequest(requestId: number, receiverId: number): void {
    this.socket.emit('accept-friend-request', {requestId, receiverId});
  }

  unfriend(friendId: number, userId: number): void {
    this.socket.emit('unfriend', {userId, friendId});
  }

  private updateUserState(updatedUser: User) {
    this.selfUserSubject.next(updatedUser);
    console.log("Updated user state:", this.selfUserSubject.value);
    
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  }

  private updateSearchResults(
    user: User,
    newStatus: string,
    friendRequest: FriendRequest | null,
    operation: 'accept' | 'remove' | 'unfriend' | 'add'
  ) {
    const searchResults = this.communicatorService.searchResultsSubject.value;
    const updatedSearchResults = searchResults.map((result) => {
      if (result._id === user._id) {
        if (operation === 'accept') {
          return {
            ...result,
            friends: [...(result.friends || []), friendRequest!.sender],
            friendRequests: result.friendRequests?.filter(
              (req) => req._id !== friendRequest!._id
            ),
          };
        }
        if (operation === 'remove') {
          return {
            ...result,
            friendRequests: result.friendRequests?.filter(
              (req) => req._id !== friendRequest!._id
            ),
          };
        }
        if (operation === 'unfriend') {
          return {
            ...result,
            friends: result.friends?.filter((friend) => friend._id !== this.selfUserSubject.value._id),
          };
        }
        if (operation === 'add') {
          return {
            ...result,
            friendRequests: [...(result.friendRequests || []), friendRequest].filter((req) => req !== null),
          };
        }
      }
      return result;
    });
    console.log('Updated search results:', updatedSearchResults);
    
    this.communicatorService.searchResultsSubject.next(updatedSearchResults as User[]);

    //update the search results present in the suggest friends subject
    const suggestFriends = this.communicatorService.suggestedFriendsSubject.value;
    const updatedSuggestedFriends =  suggestFriends.map((result) => {
      if (result._id === user._id) {
        if (operation === 'accept') {
          return {
            ...result,
            friends: [...(result.friends || []), friendRequest!.sender],
            friendRequests: result.friendRequests?.filter(
              (req) => req._id !== friendRequest!._id
            ),
          };
        }
        if (operation === 'remove') {
          return {
            ...result,
            friendRequests: result.friendRequests?.filter(
              (req) => req._id !== friendRequest!._id
            ),
          };
        }
        if (operation === 'unfriend') {
          return {
            ...result,
            friends: result.friends?.filter((friend) => friend._id !== this.selfUserSubject.value._id),
          };
        }
        if (operation === 'add') {
          return {
            ...result,
            friendRequests: [...(result.friendRequests || []), friendRequest].filter((req) => req !== null),
          };
        }
      }
      return result;
    });

    console.log('Updated suggested friends:', updatedSuggestedFriends);
    
    this.communicatorService.suggestedFriendsSubject.next([...updatedSuggestedFriends]);
  }

  
}


    

