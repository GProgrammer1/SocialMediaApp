// Angular Core Imports
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';  // Import NgForm for form handling

// Import Post interface from the models.ts file located in the 'models' directory
import { Post } from '../models';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  // Initialize post with default values
  post: Post = {
    _id: undefined, // Optional; usually filled by the backend
    likes: [],      // Assuming this starts empty
    dislikes: [],   // Assuming this starts empty
    comments: [],   // Assuming this starts empty
    uploadDate: new Date(),  // Defaults to current time
    lastUpdateDate: new Date(), // Defaults to current time
    contentType: '', // Initial empty string; to be filled by user input
    mediaUrl: '',    // Initial empty; to be filled by user input
    privacyStatus: 'Public', // Default privacy status
    userId: 123,     // Example user ID, replace with actual user ID from your user authentication logic
  };

  constructor() {}

  ngOnInit(): void {
    // Any initialization logic you might have goes here
  }

  // Example method to handle form submission
  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Form Submission', this.post);
      // Here you would typically call a service to handle the backend API submission
    }
  }
}
