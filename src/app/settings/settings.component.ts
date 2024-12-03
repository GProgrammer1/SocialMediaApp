import { Component } from '@angular/core';
// Inline Delete Confirmation Dialog Component

import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../user.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-settings',
  standalone: true,

  imports: [
    FormsModule, ReactiveFormsModule, MatButtonModule, CommonModule,
    MatIconModule, MatOptionModule, MatListModule, MatDialogModule,
    MatSlideToggleModule, NavbarComponent, MatCheckboxModule,
    RouterLink
  ],

  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  isNotificationsOn: boolean = JSON.parse(sessionStorage.getItem('user')!).notifications;
  accessOptions: string[] = ['Public', 'Friends Only', 'Private'];
  selectedAccessLevel: string = this.accessOptions[0];
isPublicAccess: boolean = JSON.parse(sessionStorage.getItem('user')!).accountPrivacy === 'Public';

  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router, private userService : UserService) {
    console.log(this.isPublicAccess);

  }

  changeAccountPrivacy() {
    const status = this.isPublicAccess ? 'Public' : 'Private';
    console.log(status);

    const user = JSON.parse(sessionStorage.getItem('user')!);
    const email = user.email;
    const formData = new FormData();
    formData.append('accountPrivacy', status);
    this.authService.updateUserInfo(email, formData).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        const oldUser = JSON.parse(sessionStorage.getItem('user')!);
        const newUser = { ...oldUser, accountPrivacy: status };
        console.log('User:', user);
        sessionStorage.setItem('user', JSON.stringify(newUser));
      },
      error: (error: any) => {
        console.error('Error:', error);
      }
    });
  }

  toggleNotifications() {
    this.isNotificationsOn = !this.isNotificationsOn;
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog);
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'confirm') {
        console.log("Account Deleted");
        this.authService.deleteAccount(sessionStorage.getItem('email')!).subscribe({
          next: (response: any) => {
            console.log('Response:', response);
            sessionStorage.clear();
            this.router.navigate(['/signup']);
          },
          error: (error: any) => {
            console.error('Error:', error);
          }
        });
      }
    });
  }

  deactivateAccount() {
    const dialogRef = this.dialog.open(DeactivateConfirmationDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.authService.deactivateAccount(sessionStorage.getItem('email')!).subscribe({
          next: (response: any) => {
            console.log('Response:', response);
            sessionStorage.clear();
            this.router.navigate(['/login']);
          },
          error: (error: any) => {
            console.error('Error:', error);
          }
        });
      }
    });
  }

  logout() {
    const dialogRef = this.dialog.open(LogoutConfirmationDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  isSelectedOption(option: string): boolean {
    return this.selectedAccessLevel === option;
  }

  changeNotification() {
    const user = JSON.parse(sessionStorage.getItem('user')!);
    const userId = user._id;
    const notification = this.isNotificationsOn;
    this.userService.changeNotifcation(userId, notification).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        const originalUser = JSON.parse(sessionStorage.getItem('user')!);
        const newUser = { ...originalUser, notifications: notification };
        console.log('NewUser:', newUser);
        sessionStorage.setItem('user', JSON.stringify(newUser));
      },
      error: (error: any) => {
        console.error('Error:', error);
      }
    });

  }
}

@Component({
  template: `
    <h2 mat-dialog-title>Account Deletion Confirmation</h2>
    <mat-dialog-content>
      Deleting your account will permanently remove all your data, including your posts, likes, and comments.
      This action cannot be undone. Are you sure you want to proceed with deleting your account?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close('cancel')">Cancel</button>
      <button mat-raised-button color="warn" (click)="close('confirm')">Delete Account</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  selector: 'app-delete-confirmation-dialog'
})
export class DeleteConfirmationDialog {
  constructor(public dialogRef: MatDialogRef<DeleteConfirmationDialog>) {}

  close(action: string) {
    this.dialogRef.close(action);
  }
}

// Inline Delete Confirmation Dialog Component
// @Component({
//   template: `
//     <h2 mat-dialog-title>Account Deletion Confirmation</h2>
//     <mat-dialog-content>
//       Deleting your account will permanently remove all your data, including your posts, likes, and comments.
//       This action cannot be undone. Are you sure you want to proceed with deleting your account?
//     </mat-dialog-content>
//     <mat-dialog-actions align="end">
//       <button mat-button (click)="close('cancel')">Cancel</button>
//       <button mat-raised-button color="warn" (click)="close('confirm')">Delete Account</button>
//     </mat-dialog-actions>
//   `,
//   standalone: true,
//   selector: 'app-delete-confirmation-dialog',
//   imports: [MatButtonModule, MatDialogModule]
// })


// Inline Deactivate Confirmation Dialog Component
@Component({
  template: `
    <h2 mat-dialog-title>Account Deactivation Confirmation</h2>
    <mat-dialog-content>
      Deactivating your account will temporarily disable your profile and remove your content from visibility.
      You can reactivate your account anytime by logging back in. Are you sure you want to deactivate?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close('cancel')">Cancel</button>
      <button mat-raised-button color="primary" (click)="close('confirm')">Deactivate Account</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  selector: 'app-deactivate-confirmation-dialog',
  imports: [MatButtonModule, MatDialogModule]
})
export class DeactivateConfirmationDialog {
  constructor(public dialogRef: MatDialogRef<DeactivateConfirmationDialog>) {}

  close(action: string) {
    this.dialogRef.close(action);
  }
}


// Inline Logout Confirmation Dialog Component
@Component({
  template: `
    <h2 mat-dialog-title>Logout Confirmation</h2>
    <mat-dialog-content>
      Are you sure you want to logout?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close('cancel')">Cancel</button>
      <button mat-raised-button color="primary" (click)="close('confirm')">Logout</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  selector: 'app-logout-confirmation-dialog',
  imports: [MatButtonModule, MatDialogModule]
})
export class LogoutConfirmationDialog {
  constructor(public dialogRef: MatDialogRef<LogoutConfirmationDialog>) {}

  close(action: string) {
    this.dialogRef.close(action);
  }
}
