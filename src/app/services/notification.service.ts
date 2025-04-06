import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // private baseUrl = 'https://localhost:7204/api'; // เปลี่ยนเป็น API ของคุณ
  private baseUrl = 'https://dotnetapi-fixasset.onrender.com/api'; // เปลี่ยนเป็น API ของคุณ

  constructor(private http: HttpClient) {}

  // 📌 ดึงรายการแจ้งเตือนของผู้ใช้ (NotificationRecipientController)
  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notificationrecipient/${userId}/notifications`, { withCredentials: true });
  }

  // 📌 อัปเดตสถานะแจ้งเตือน (Mark as Read) (NotificationRecipientController)
  markAsRead(notificationId: number, userId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notificationrecipient/${notificationId}/mark-as-read/${userId}`, {}, { withCredentials: true });
  }

  // 📌 ลบการแจ้งเตือน (NotificationsController)
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/${notificationId}`, { withCredentials: true });
  }

}
