import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { CourseListComponent } from './components/course-list/course-list.component';
import { LoadingService } from '../services/loader.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CourseListComponent, 
    MatProgressSpinnerModule, 
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'text-to-learn-frontend';

  constructor(public loadingService: LoadingService) {}
}