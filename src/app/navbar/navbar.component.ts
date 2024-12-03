import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router) {}

  isAdmin: boolean = false;

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  //TODO: Implement a secure role check mechanism
  checkAdminAccess(): boolean {
    // Replace this with a secure role check mechanism
    return localStorage.getItem('role') === 'admin';
  }

}
