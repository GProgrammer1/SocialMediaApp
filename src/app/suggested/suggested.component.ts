import { Component } from '@angular/core';

@Component({
  selector: 'app-suggested',
  standalone: true,
  imports: [],
  templateUrl: './suggested.component.html',
  styleUrl: './suggested.component.css'
})
export class SuggestedComponent {
  suggestedFriends = [
    { name: 'Alice Johnson', email: 'alice@example.com', profilePicture: null },
    { name: 'Bob Smith', email: 'bob@example.com', profilePicture: 'assets/bob-pic.jpeg' },
    { name: 'Charlie Brown', email: 'charlie@example.com', profilePicture: 'assets/charlie-pic.jpeg' },
  ];

  addFriend(friend: any) {
    console.log(`${friend.name} added as a friend.`);
    // Logic to add the friend (e.g., update the server or local list)
    // Optionally, remove the friend from the suggested list:
    this.suggestedFriends = this.suggestedFriends.filter(f => f !== friend);
  }
}
