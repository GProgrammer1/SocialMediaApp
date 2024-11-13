import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NavbarComponent, FormsModule, RouterLink, MatIconModule, MatSlideToggleModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  isNotificationsOn: boolean = false;
  isPublicAccess: boolean = true;

  toggleNotifications() {
    this.isNotificationsOn = !this.isNotificationsOn;
  }

  isSelectedOption() {
    this.isPublicAccess = !this.isPublicAccess;
  }
}
