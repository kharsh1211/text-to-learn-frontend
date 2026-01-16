import { Component, OnDestroy, OnInit } from '@angular/core';
import { CourseService, Course } from '../../../services/course.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CourseDetailComponent } from '../course-detail/course-detail.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { CourseListComponent } from '../course-list/course-list.component';
import { LoadingService } from '../../../services/loader.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, CourseDetailComponent, CourseListComponent],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
    ]),
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  topic: string = '';
  course: Course | null = null;
  isNewCourse: boolean = false;
  showCourse: boolean = false;
  newChatPage: boolean = false;
  private newChatSubscription?: Subscription;
  isGenerating: boolean = false;

  constructor(private courseService: CourseService, public loadingService: LoadingService) {}

  ngOnInit() {
    this.newChatSubscription = this.courseService.newChatRequested$.subscribe(
      () => {
        this.startNewChat();
      }
    );
  }

  createCourse() {
    if (!this.topic.trim()) return;
    this.isGenerating = true;
    this.isNewCourse = true;
    this.showCourse = true;
    this.newChatPage = true;
    if (this.topic.trim()) {
      this.courseService.createCourse(this.topic).subscribe({
        next: (data) => {
          this.course = data;
          this.topic = '';
          this.newChatPage = false;
        },
        error: (err) => {
          console.error('Error creating course', err);
          this.isGenerating = false;
        },
      });
    }
  }
  startNewChat() {
    this.showCourse = false;
    this.course = null;
    this.topic = '';
    this.isGenerating = false;
  }
  selectCourse(selectedCourse: Course) {
    console.log('Course Selected:', selectedCourse);
    this.course = selectedCourse;
    this.isNewCourse = false;
    this.showCourse = true;
    this.isGenerating = true;
  }
  newChat() {
  this.showCourse = false;     
  this.course = null;          
  this.topic = '';             
  this.isGenerating = false;   
  this.isNewCourse = false;    
}
  ngOnDestroy() {
    this.newChatSubscription?.unsubscribe();
  }
}
