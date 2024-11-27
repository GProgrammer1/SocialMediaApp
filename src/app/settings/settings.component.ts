import { Component } from '@angular/core';

import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  standalone: true,

  imports: [
    FormsModule, MatButtonModule, CommonModule,
    MatIconModule, MatOptionModule, MatListModule, MatDialogModule, NavbarComponent, MatSlideToggleModule
  ],

  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  isNotificationsOn: boolean = false;
  accessOptions: string[] = ['Public', 'Friends Only', 'Private'];
  selectedAccessLevel: string = this.accessOptions[0];
isPublicAccess: any;

  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router) {}

  changeAccountPrivacy(status: string) {
    console.log('Account Privacy:', status);
    this.authService.updateUserInfo(sessionStorage.getItem('email')!, { accountPrivacy: status }).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        const user = response.user;
        console.log('User:', user);
        sessionStorage.setItem('user', JSON.stringify(user));
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
    dialogRef.afterClosed().subscribe(result => {
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

 

}

// Inline Delete Confirmation Dialog Component
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
  imports: [MatButtonModule, MatDialogModule]
})
export class DeleteConfirmationDialog {
  constructor(private dialogRef: MatDialogRef<DeleteConfirmationDialog>) {}

  close(action: 'confirm' | 'cancel') {
    this.dialogRef.close(action);
  }
}

// Inline Deactivate Confirmation Dialog Component
@Component({
  selector: 'app-settings',
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
  imports: [MatButtonModule, MatDialogModule]
})
export class DeactivateConfirmationDialog {
  constructor(private dialogRef: MatDialogRef<DeactivateConfirmationDialog>) {}

  close(action: 'confirm' | 'cancel') {
    this.dialogRef.close(action);
  }
}

// Inline Logout Confirmation Dialog Component
@Component({
  selector: 'app-settings',
  template: `
    <h2 mat-dialog-title>Logout Confirmation</h2>
    <mat-dialog-content>
      Are you sure you want to log out? You will be signed out of your account, and you will need to log in again to access your content.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close('cancel')">Cancel</button>
      <button mat-raised-button color="warn" (click)="close('confirm')">Logout</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogModule]
})
export class LogoutConfirmationDialog {
  constructor(private dialogRef: MatDialogRef<LogoutConfirmationDialog>) {}

  close(action: 'confirm' | 'cancel') {
    this.dialogRef.close(action);
  }
}
