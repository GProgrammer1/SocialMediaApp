import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Story } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  storiesSubject = new BehaviorSubject<Story[]>([]);
  stories$ = this.storiesSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchStories() {
    this.http.get<Story[]>('http://localhost:3000/story').subscribe((stories) => {
      this.storiesSubject.next(stories);
    });
  }

  addStory(storyData: FormData) {
    return this.http.post('http://localhost:3000/story/create', storyData);
  }

  markAsViewed(storyId: string, userId: number) {
    return this.http.post('http://localhost:3000/story/view', { storyId, userId });
  }

  
}
