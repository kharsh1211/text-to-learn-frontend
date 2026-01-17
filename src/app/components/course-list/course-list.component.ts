import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Course, CourseService } from '../../../services/course.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  searchText: string = '';

  // To communicate with the ChatComponent
  @Output() courseSelected = new EventEmitter<Course>();
  @Output() newChatRequested = new EventEmitter<void>();

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
    // Refresh the list whenever a new course is created
    this.courseService.refreshHistory$.subscribe(() => this.loadCourses());
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.filterCourses();
        // console.log(this.courses);
      },
      error: (err) => console.error('Could not load course history', err),
    });
  }

  onSelectCourse(course: Course): void {
    // console.log('Sidebar: Course clicked!', course.title);
    this.courseSelected.emit(course);
  }

  startNewChat(): void {
    this.newChatRequested.emit();
    this.courseService.triggerRefresh(); 
  
    this.searchText = '';
    this.currentPage = 1;
  }
  filterCourses(): void {
    this.currentPage = 1;
    // 1. If search is empty, show everything
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredCourses = [...this.courses];
      return;
    }
    // console.log('Searching for:', this.searchText);
    // 2. Perform a case-insensitive search
    const query = this.searchText.toLowerCase().trim();
    this.filteredCourses = this.courses.filter((course) =>
      course.title.toLowerCase().includes(query)
    );
  }
  currentPage: number = 1;
  pageSize: number = 8; 

  
  get paginatedCourses(): Course[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredCourses.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCourses.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}
