// 👤 UserService - จัดการข้อมูลผู้ใช้งาน
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'https://localhost:7204/api/';

  constructor(private http: HttpClient) {}

  // ✅ ดึงข้อมูลผู้ใช้ตาม ID
  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}Users/${userId}`, { withCredentials: true });
  }

  // ✅ ดึงจำนวนผู้ใช้ในแต่ละสำนักงาน
  getUserCountByDepartment(deptId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}users/count/by-department/${deptId}`, { withCredentials: true });
  }

  // ✅ ดึงผู้ใช้งานทั้งหมด
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}Users`, { withCredentials: true });
  }

  // ✅ ลบผู้ใช้งาน
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}Users/${userId}`, { withCredentials: true });
  }

  // ✅ อัปเดตข้อมูลผู้ใช้งาน
  updateUser(userId: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}Users/${userId}`, payload, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(
      'https://localhost:7204/auth/logout',
      {}, // <- body ว่าง
      { withCredentials: true } // <- ใส่ options ตรงนี้
    );
  }
  
  
}