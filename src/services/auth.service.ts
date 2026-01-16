import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080'; // Adjust if your backend URL is different
  private _isAuthenticated = false;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    return this.http.post(`${this.baseUrl}/login`, body.toString(), { headers, responseType: 'text' })
      .pipe(
        tap(() => {
          this._isAuthenticated = true;
        }),
        catchError((error) => {
          this._isAuthenticated = false;
          throw error;
        })
      );
  }

  logout(): void {
    this._isAuthenticated = false;
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe();
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
}
