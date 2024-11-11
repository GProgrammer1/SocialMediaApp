import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NavbarComponent,FormsModule,RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  isNotificationsOn: boolean = false;
  accessOptions: string[] = ['Public', 'Friends Only', 'Private'];
  selectedAccessLevel: string = this.accessOptions[0];

  toggleNotifications() {
    this.isNotificationsOn = !this.isNotificationsOn;
  }

  // Additional helper method for conditional display
  isSelectedOption(option: string): boolean {
    return this.selectedAccessLevel === option;
  }
}
