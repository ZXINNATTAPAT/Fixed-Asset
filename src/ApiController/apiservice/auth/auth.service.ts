// 🔐 AuthService - จัดการ Login, Logout, ตรวจสอบสิทธิ์
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = 'https://localhost:7204/auth/';

  constructor(private http: HttpClient) {}

  // ✅ Login
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.authUrl}login`, credentials, { withCredentials: true });
  }

  // ✅ Logout
  logout(): Observable<any> {
    return this.http.post(`${this.authUrl}logout`, {}, { withCredentials: true });
  }

  // ✅ ดึงข้อมูล role ปัจจุบันของผู้ใช้
  getUserRole(): Observable<{ username: string; userId: number; roles: string[] }> {
    return this.http.get<{ username: string; userId: number; roles: string[] }>(`${this.authUrl}userrole`, { withCredentials: true });
  }

  // ✅ ตรวจสอบสถานะว่า login อยู่ไหม พร้อม role
  getAuthStatus(): Observable<{ isAuthenticated: boolean; username: string; userId: number; roles: string[] }> {
    return this.http.get<{ isAuthenticated: boolean; username: string; userId: number; roles: string[] }>(
      `${this.authUrl}isauthenticated`,
      { withCredentials: true }
    ).pipe(
      catchError(() => of({ isAuthenticated: false, username: '', userId: 0, roles: [] }))
    );
  }

  // ✅ ตรวจสอบว่า login อยู่ไหม (แบบ boolean)
  isLoggedIn(): Observable<boolean> {
    return this.http.get(`${this.authUrl}isLoggedIn`, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ✅ ดึงข้อมูลโปรไฟล์จาก token
  getUserInfos(): Observable<any> {
    return this.http.get(`${this.authUrl}profile`, { withCredentials: true });
  }
} 