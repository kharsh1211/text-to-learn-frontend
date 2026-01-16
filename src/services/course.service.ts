import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';

export interface Lesson {
  id: number;
  title: string;
  content: string;
}

export interface Module {
  learning_objectives: any;
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  mainTopicVideos: any;
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = `${environment.apiUrl}/courses`;
  private newChatSource = new Subject<void>();
  private refreshHistory = new Subject<void>();
  newChatRequested$ = this.newChatSource.asObservable();
  refreshHistory$ = this.refreshHistory.asObservable();

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  createCourse(topic: string): Observable<Course> {
    const payload = { topic: topic };
    return this.http.post<Course>(this.apiUrl, payload);
  }

  requestNewChat() {
    this.newChatSource.next();
  }
  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/all`);
  }
  triggerRefresh() {
  this.refreshHistory.next();
}

}