import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, NavbarComponent],
})
export class EditProfileComponent {
  editProfileForm: FormGroup;
  profileImage: string | null = 'assets/default-profile.png'; // Default profile image placeholder

  constructor(private fb: FormBuilder, private router: Router) {
    // Initialize form group with validators
    this.editProfileForm = this.fb.group({
      profilePicture: [null], // Placeholder for file upload
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', Validators.maxLength(150)],
      profession: ['', Validators.maxLength(100)],
      location: ['', Validators.maxLength(100)],
    });

    this.loadExistingData(); // Load existing data into the form
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
      const reader = new FileReader();

      reader.onload = () => {
        this.profileImage = reader.result as string; // Update preview with the selected image
      };

      reader.readAsDataURL(file); // Convert file to base64 string
    }
  }

  // Save the updated profile changes
  saveChanges() {
    if (this.editProfileForm.valid) {
      const updatedProfile = this.editProfileForm.value;
      console.log('Updated Profile:', updatedProfile);
      // Navigate back to the profile page after saving
      this.router.navigate(['/profile']);
    }
  }

  // Cancel editing and return to the profile page
  cancel() {
    this.router.navigate(['/profile']);
  }
}
