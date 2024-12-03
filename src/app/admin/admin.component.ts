import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { AdminService } from '../services/admin.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AdminService } from '../admin.service';
import { User } from '../../models';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [MatTableModule, CommonModule, NavbarComponent, MatButtonModule]
})
export class AdminDashboardComponent implements OnInit {
  usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  users$: Observable<User[]> = this.usersSubject.asObservable();

  apiUrl: string = 'http://your-api-url.com';
  constructor(private adminService: AdminService, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.adminService.getAllUsers().subscribe((data: any) => {
      const users = data.users ; // Adjust based on your API's response structure
      this.usersSubject.next(users);
    });
  }

  deleteUser(userId: number): void {
    this.adminService.deleteUser(userId).subscribe(
      (response : any) => {
        const userId = response.user;
        console.log('Deleted user:', userId);
        
        const users = this.usersSubject.value.filter(user => user._id !== userId);
        this.usersSubject.next(users);
      }
    );
  }

 
  // Remove this from AdminDashboardComponent
  

  viewProfile(userId: number): void {
    this.router.navigate(['/view-profile'], {queryParams: {userId}}); // Navigates to the user's profile
  }


}
