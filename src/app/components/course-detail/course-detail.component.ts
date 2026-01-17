import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Course } from '../../../services/course.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  @Input() course!: any; // Using any to match the dynamic AI structure
  @Input() isNew: boolean = false;
  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef;

  activeModuleIndex: number | null = 0;
  displayedCourse: any = { title: '', description: '', modules: [] };
  private intervals: any[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['course'] && !changes['course'].firstChange) {
      this.refreshCourseView();
    }
  }

  ngOnInit() {
    this.refreshCourseView();
  }

  private refreshCourseView() {
    this.clearAllIntervals();
    const contentArea = document.querySelector('.chat-content');
    if (contentArea) contentArea.scrollTop = 0;

    if (this.isNew) {
      this.displayedCourse = { title: '', description: '', modules: [] };
      this.typewriterEffect(this.course);
    } else {
      this.displayedCourse = { ...this.course };
    }
  }

  async typewriterEffect(fullCourse: any) {
  // 1. Initialize with topic and empty description/modules
  this.displayedCourse = {
    title: '',         // Start empty for the topic typewriter
    description: '',
    modules: [],
  };

  // 2. Type the Course Topic (Title)
  await this.typeString(fullCourse.title, (val) => {
    this.displayedCourse.title = val;
  });

  // 3. Type the Course Description
  await this.typeString(fullCourse.description, (val) => {
    this.displayedCourse.description = val;
    this.scrollToBottom();
  });

  // 4. Loop through Modules Sequentially
  for (const module of fullCourse.modules) {
    const newModule: any = {
      ...module,
      title: '',
      learning_objectives: [],
      lessons: [],
      moduleVideoUrl: '', // Hide video until the end of this module
    };
    this.displayedCourse.modules.push(newModule);

    // Type Module Title
    await this.typeString(module.title, (val) => {
      newModule.title = val;
    });

    // Type Learning Objectives
    for (const obj of module.learning_objectives) {
      const idx = newModule.learning_objectives.length;
      newModule.learning_objectives.push('');
      await this.typeString(obj, (val) => {
        newModule.learning_objectives[idx] = val;
      });
    }

    // Type Lessons in this Module
    for (const lesson of module.lessons) {
      const newLesson: any = {
        ...lesson,
        title: '',
        detailed_content: '',
        practical_exercise: '',
      };
      newModule.lessons.push(newLesson);

      await this.typeString(lesson.title, (val) => {
        newLesson.title = val;
      });
      await this.typeString(lesson.detailed_content, (val) => {
        newLesson.detailed_content = val;
      });
      
      if (lesson.practical_exercise) {
        await this.typeString(lesson.practical_exercise, (val) => {
          newLesson.practical_exercise = val;
        });
      }
    }

    // 5. THE MODULE VIDEO: Reveal after lessons are finished
    if (module.moduleVideoUrl) {
      // We set the URL which triggers the iframe in HTML
      newModule.moduleVideoUrl = module.moduleVideoUrl;

      // Small delay to allow the iframe to affect the DOM height
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }
}

  typeString(fullText: string, updateFn: (val: string) => void): Promise<void> {
    return new Promise((resolve) => {
      if (!fullText) {
        resolve();
        return;
      }
      const words = fullText.split(' ');
      let index = 0;
      const interval = setInterval(() => {
        if (index < words.length) {
          updateFn(words.slice(0, index + 1).join(' '));
          index++;
          this.autoScroll();
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 30);
      this.intervals.push(interval);
    });
  }

  private autoScroll() {
    const contentArea = document.querySelector('.chat-content');
    if (contentArea) {
      const threshold = 150;
      const isAtBottom =
        contentArea.scrollHeight -
          contentArea.scrollTop -
          contentArea.clientHeight <
        threshold;
      if (isAtBottom) contentArea.scrollTop = contentArea.scrollHeight;
    }
  }

  getSafeVideoUrl(videoUrl: string): SafeResourceUrl {
    const videoId = this.extractId(videoUrl);
    if (!videoId) return '';

    // Transform watch link to secure embed link
    const embedUrl = `https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}&enablejsapi=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
  private extractId(url: string): string | null {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  }
  calculateProgress(): number {
    if (!this.displayedCourse?.modules?.length) return 0;
    return (
      ((this.activeModuleIndex ?? 0) / this.displayedCourse.modules.length) *
      100
    );
  }

  private clearAllIntervals() {
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals = [];
  }
  encodeURIComponent(url: string): string {
    return encodeURIComponent(url);
  }
  isDirectVideo(url: string): boolean {
    return !!this.extractId(url);
  }
  scrollToBottom() {
  if (this.scrollAnchor) {
    // We use 'smooth' so it doesn't look jerky
    this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

  ngOnDestroy() {
    this.clearAllIntervals();
  }
}
