import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SuggestedComponent } from '../suggested/suggested.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SuggestedComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {

}
