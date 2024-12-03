import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { PostService } from '../post.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent,
    MatSnackBarModule
  ],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  postForm: FormGroup;
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private postService: PostService, private snackbar: MatSnackBar) {
    this.postForm = this.fb.group({
      text: new FormControl('', Validators.required),
      privacyStatus: new FormControl('public', Validators.required)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Generate file preview
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result;
      };
      
      
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.postForm.valid && this.selectedFile) {

      console.log(this.selectedFile);
      
      const user = JSON.parse(sessionStorage.getItem('user')!);
      
      console.log('User:', user);
      
      const userId = user._id;
      
      
      const formData = new FormData();
      formData.append('media', this.selectedFile);
      formData.append('text', this.postForm.value.text);
      formData.append('privacyStatus', this.postForm.value.privacyStatus);
      formData.append('user', userId);
      
      console.log('Form data:', formData);
      this.loading = true;
      
      setTimeout(() => {
      this.postService.createPost(formData).subscribe(
        {
          next: (res: any) => {
            const newUser = res.updatedUser;
            const newPost = res.updatedPost;
            console.log(newPost);
            
            sessionStorage.setItem('user', JSON.stringify(newUser));

            this.postForm.reset();
            this.selectedFile = null;
            this.snackbar.open('Post created successfully', 'Close', {
               duration: 3000,
               verticalPosition: 'top',
                horizontalPosition: 'center'}); 
            this.loading = false;        
          },
          error: (err) => {
            console.error('Error creating post', err);
            this.snackbar.open('Error creating post', 'Close', {
               duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center'
              });
            this.loading = false;
          }
        }
      )
    }, 2000);
      // Logic to send the formData to the backend
      console.log('Post submitted', formData);
    } else {
      console.error('Form is invalid or no file selected');
    }
  }
}
