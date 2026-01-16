import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = signal(false);
  loading$ = this._loading;

  show() {
    setTimeout(() => {
      this._loading.set(true);
    });
  }

  hide() {
    setTimeout(() => {
      this._loading.set(false);
    });
  }
}