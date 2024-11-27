import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  createPost(post: FormData) {
    return this.http.post('http://localhost:3000/post/create', post);
  }
  
  constructor(private http: HttpClient) { }
}
