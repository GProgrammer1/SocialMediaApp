import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Story } from '../../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-story-viewer',
  standalone: true,
  imports: [MatSliderModule, FormsModule, MatIconModule, CommonModule],
  templateUrl: './story-viewer.component.html',
  styleUrl: './story-viewer.component.css'
})
export class StoryViewerComponent {
  currentIndex: number = 0;
  stories: Story[] = [];
  currentStory: Story;

  constructor(
    public dialogRef: MatDialogRef<StoryViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStory: Story, stories: Story[] }
  ) {
    // Assign the initial story and the stories array
    this.stories = data.stories;
    console.log("Stories in view: ", this.stories);

    this.currentStory = data.currentStory;
    console.log("Current story: ", this.currentStory);

  }

  timeAgo(createdAt: Date): string {
    const timeDifference = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(timeDifference / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  }

  nextStory(): void {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.currentStory = this.stories[this.currentIndex];
    }
  }

  previousStory(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentStory = this.stories[this.currentIndex];
    }
  }

  // Handle slider input to update the current index and story
  onSliderInput(event: any): void {
    const newIndex = event.value - 1;  // Convert slider value to index
    if (newIndex !== this.currentIndex && newIndex >= 0 && newIndex < this.stories.length) {
      this.currentIndex = newIndex;
      this.currentStory = this.stories[this.currentIndex];
    }
  }

  getStoryUserName(story: Story): string {
    return this.currentStory.user?.name;
  }
}
