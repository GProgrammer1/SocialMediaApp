import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from "../navbar/navbar.component";
import { AuthService } from '../auth.service';
import { state } from '@angular/animations';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, NavbarComponent],
})
export class EditProfileComponent {
  editProfileForm: FormGroup;
  profileImage: File | null = null; // Initialize profileImage as a File (null initially)

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    // Initialize form group with validators
    this.editProfileForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', Validators.maxLength(150)],
    });
  }

  // Load mock data into the form (simulate API call or service)
  loadExistingData() {
    const mockProfile = {
      username: 'John Doe',
      email: 'johndoe@example.com',
      bio: 'A passionate developer and tech enthusiast.',
      profession: 'Software Engineer',
      location: 'Lebanon',
    };

    this.editProfileForm.patchValue(mockProfile);
  }

  // Handle file input for profile picture
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      this.profileImage = file; // Store the file directly (no need to convert to base64)
      
      // Optionally, you can display a preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        const previewImage = reader.result as string;
        // You can use this preview image for UI preview
      };
      reader.readAsDataURL(file);
    }
  }

  // Save the updated profile changes
  saveChanges() {
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

      console.log('Updated Profile:', updatedProfile);

      this.authService.updateUserInfo(email, formData).subscribe({
        next: (response: any) => {
          console.log('Response:', response.user);
          const user = JSON.parse(sessionStorage.getItem('user')!);
          const responseUser = response.user;
          const newUser = { ...user, profilePic: responseUser.profilePic, bio: responseUser.bio,  name: responseUser.name };
          sessionStorage.setItem('user', JSON.stringify(newUser));
          this.router.navigate(['/profile', { state: { updated: true } }]);
        },
        error: (error: any) => {
          console.error('Error:', error);
        }
      });

      // Navigate back to the profile page after saving
      ;
    }
  }

  // Cancel editing and return to the profile page
  cancel() {
    this.router.navigate(['/profile']);
  }
}
