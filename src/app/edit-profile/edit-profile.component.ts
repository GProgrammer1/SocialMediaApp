import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from "../navbar/navbar.component";
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, NavbarComponent],
})
export class EditProfileComponent implements OnInit {
  editProfileForm: FormGroup;
  profileImagePreview: string | null = null; // Stores the preview URL for the profile image
  profileImage: File | null = null; // Selected profile image file

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Initialize form group with validators
    this.editProfileForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', Validators.maxLength(150)],
    });
  }

  ngOnInit(): void {
    this.loadExistingData();
  }

  // Load existing data into the form
  loadExistingData(): void {
    // Get the current user data from session storage (or fetch it from a service)
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    if (user) {
      this.editProfileForm.patchValue({
        username: user.name,
        email: user.email,
        bio: user.bio,
      });

      // Load the profile picture preview
      this.profileImagePreview = user.profilePic || 'assets/default-profile.png';
    }
  }

  // Handle file input for profile picture
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      this.profileImage = file; // Store the file directly

      // Update the preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Save the updated profile changes
  saveChanges(): void {
    if (this.editProfileForm.valid) {
      const updatedProfile = this.editProfileForm.value;
      const { username, email, bio } = updatedProfile;
      const formData = new FormData();

      formData.append('name', username);
      formData.append('email', email);
      formData.append('bio', bio);

      // If a profile image was selected, append it as a file to the FormData
      if (this.profileImage) {
        formData.append('profilePicture', this.profileImage, this.profileImage.name);
      }

      this.authService.updateUserInfo(email, formData).subscribe({
        next: (response: any) => {
          const user = JSON.parse(sessionStorage.getItem('user')!);
          const responseUser = response.user;
          const newUser = {
            ...user,
            profilePic: responseUser.profilePic,
            bio: responseUser.bio,
            name: responseUser.name,
          };
          sessionStorage.setItem('user', JSON.stringify(newUser));
          this.router.navigate(['/profile', { state: { updated: true } }]);
        },
        error: (error: any) => {
          console.error('Error:', error);
        }
      });
    }
  }

  // Cancel editing and return to the profile page
  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
