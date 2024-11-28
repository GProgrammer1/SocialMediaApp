import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SuggestedComponent } from '../suggested/suggested.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SuggestedComponent, MatIconModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {
  searchQuery: string = '';
  searchResults: Array<{ name: string; email: string; profilePicture?: string; isFriend: boolean }> = [];

  onSearch(): void {
    if (!this.searchQuery.trim()) return;

    // Mock search logic (replace with API integration if needed)
    this.searchResults = [
      { name: 'John Doe', email: 'john@example.com', isFriend: true },
      { name: 'Jane Smith', email: 'jane@example.com', isFriend: false },
      { name: 'Sarah Connor', email: 'sarah@example.com', isFriend: false },
    ].filter((user) =>
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addFriend(user: any): void {
    user.isFriend = true;
    console.log(`Friend request sent to ${user.name}`);
  }

  removeFriend(user: any): void {
    user.isFriend = false;
    console.log(`${user.name} removed from friends`);
  }
}
