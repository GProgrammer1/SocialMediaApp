import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { SuggestedComponent } from '../suggested/suggested.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
  imports: [MatDialogModule, SuggestedComponent, AsyncPipe],
  standalone: true,
})
export class FriendsListComponent {
  constructor(
    public dialogRef: MatDialogRef<FriendsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { friends: any[] }
  ) {}


  friendsSubject = new BehaviorSubject<User[]>([]);
  friends$ = this.friendsSubject.asObservable();

  get friends() {
    return this.data.friends;
  }
  removeFriend(index: number) {
    this.friends.splice(index, 1); // Removes the friend at the specified index
  }
}
