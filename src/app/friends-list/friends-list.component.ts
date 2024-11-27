import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
  imports: [MatDialogModule],
  standalone: true,
})
export class FriendsListComponent {
  constructor(
    public dialogRef: MatDialogRef<FriendsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { friends: any[] }
  ) {}

  get friends() {
    return this.data.friends;
  }
}
