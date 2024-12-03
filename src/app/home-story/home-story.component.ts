import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';  // Snackbar for notifications
import { PostService } from '../post.service';
import { Observable } from 'rxjs';
import { Story, User } from '../../models';
import { CommunicatorService } from '../communicator.service';
import { StoryViewerComponent } from '../story-viewer/story-viewer.component';

@Component({
  selector: 'app-home-story',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatSnackBarModule],
  templateUrl: './home-story.component.html',
  styleUrls: ['./home-story.component.css']
})
export class HomeStoryComponent implements OnInit {
  friends = [
    { name: 'John Doe', storyImage: 'assets/images/story1.jpg' },
    { name: 'Jane Smith', storyImage: 'assets/images/story2.jpg' },
    { name: 'Alice Johnson', storyImage: 'assets/images/story3.jpg' },
  ];

  stories$! : Observable<Story[] | null>;

  constructor(private matdialog: MatDialog, private snackBar: MatSnackBar, private communicatorService: CommunicatorService,
    private postService: PostService
  ) {
    this.stories$ = this.communicatorService.stories$;
  }
  groupedStories: { [userId: string]: Story[] } = {};
  // Functionality to handle story click
  viewStory(story: Story): void {
    const userStories = this.groupedStories[story.user._id!];
    console.log("User stories", userStories);

    this.matdialog.open(StoryViewerComponent, {
      width: '500px',
      data: { stories: userStories, currentStory: story }
    });
  }

  addStory(): void {
    const dialogRef = this.matdialog.open(StoryDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the story that was added, like saving it to a server
        console.log('Story added:', result);
      }
    });
  }

  ngOnInit(): void {
      this.postService.loadStories();
      this.stories$.subscribe(stories => {
        this.groupStoriesByUser(stories!);
      });
  }

  groupStoriesByUser(stories: Story[]): void {
    this.groupedStories = stories.reduce((acc: { [key: string]: Story[] }, story) => {
      if (!acc[story.user._id!]) {
        acc[story.user._id!] = [];
      }
      acc[story.user._id!].push(story);
      return acc;
    }, {});
  }

}



// Define the StoryDialogComponent inside the same file
@Component({
  selector: 'app-story-dialog',
  template: `
    <h1 mat-dialog-title>Add a New Story</h1>
    <div mat-dialog-content>
        <mat-label>Story Image</mat-label>
        <input type="file" (change)="onFileChange($event)">

      <div >
        @if(imagePreview) {
          <img [src]="imagePreview" alt="Image Preview" class="image-preview" />
        }

      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onAddStory()">Add Story</button>
    </div>
  `,
  styles: [`
    .image-preview {
      max-width: 100%;
      max-height: 200px;
      margin-top: 10px;
    }
    mat-form-field {
      width: 100%;
    }
  `],
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, CommonModule],
})
export class StoryDialogComponent {
  imagePreview: string | null = null;  // To display image preview
  storyImage: File | null = null;  // To hold the file selected by the user

  constructor(public dialogRef: MatDialogRef<StoryDialogComponent>, private snackBar: MatSnackBar,
    private postService: PostService
  ) {}

  onNoClick(): void {
    this.dialogRef.close(); // Close the dialog without doing anything
  }

  onFileChange(event: any): void {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      // Validate the file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file.', 'Close', { duration: 3000 });
        return;
      }

      // FileReader for generating the preview
      const previewReader = new FileReader();
      previewReader.onload = () => {
        this.imagePreview = previewReader.result as string; // Base64 string for preview
      };
      previewReader.onerror = () => {
        this.snackBar.open('Error reading file for preview.', 'Close', { duration: 3000 });
      };
      previewReader.readAsDataURL(file); // Read the file as a base64 string for preview

      // FileReader for uploading the file as ArrayBuffer
      const uploadReader = new FileReader();
      uploadReader.onload = () => {
        const fileData = uploadReader.result as ArrayBuffer; // ArrayBuffer for upload
        const fileName = file.name;
        const userId = JSON.parse(sessionStorage.getItem('user')!)._id;

        // Send the file data to the server
        this.postService.uploadStory(fileData, fileName, userId);
      };
      uploadReader.onerror = () => {
        this.snackBar.open('Error reading file for upload.', 'Close', { duration: 3000 });
      };
      uploadReader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer for upload
    }
  }



  onAddStory(): void {
    if (!this.storyImage) {
      this.snackBar.open('Please select an image for the story.', 'Close', { duration: 3000 });
      return;
    }

    // You can add more validation logic here, like checking the file type, size, etc.
    const name = this.storyImage.name;
    const userId = JSON.parse(sessionStorage.getItem('user')!).id;
    console.log('Uploading story:', name, 'for user:', userId);

    const story = {
      user: userId,
      mediaUrl: 'http://',

    }

    console.log('Story image:', this.storyImage);
    this.dialogRef.close(this.storyImage);  // You can modify this logic to send the file to your server
  }
}

