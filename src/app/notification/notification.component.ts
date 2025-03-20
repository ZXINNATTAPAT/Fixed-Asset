import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DataService } from '../data-service/data-service.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgClass ,RouterLink],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  userId: number | null = null; // ✅ ใช้ `null` แทนค่าเริ่มต้น

  // ✅ ใช้ `inject` (Angular 16+) หรือ Constructor สำหรับ Dependency Injection
  private notificationService = inject(NotificationService);
  private dataService = inject(DataService);
  private router = inject(Router);

 
  ngOnInit(): void {
    this.getUserIdAndLoadNotifications(); // ✅ โหลด `userId` ก่อน แล้วค่อยโหลดแจ้งเตือน
  }

  // ✅ ฟังก์ชันซ่อนแจ้งเตือนแทนการลบ
  hideNotification(index: number): void {
    this.notifications[index].isHidden = true; 
  }


  /**
   * ✅ ดึง `userId` จาก `DataService` และโหลดแจ้งเตือน
   */
  getUserIdAndLoadNotifications(): void {
    this.dataService.userInfo$.subscribe({
      next: (userInfo) => {
        this.userId = userInfo?.userId ? Number(userInfo.userId) : null;

        if (this.userId) {
          console.log(`🔍 User ID Loaded: ${this.userId}`);
          this.loadNotifications();
        } else {
          console.error('⚠️ User ID not found! Make sure user is logged in.');
        }
      },
      error: (err) => {
        console.error("❌ Error fetching user info:", err);
      }
    });
  }

  /**
   * ✅ โหลดรายการแจ้งเตือนของผู้ใช้
   */
  loadNotifications(): void {
    if (!this.userId) return; // ❌ ถ้าไม่มี `userId` ไม่ต้องโหลด

    this.notificationService.getNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
        console.log("✅ Notifications Loaded:", this.notifications);
      },
      error: (err) => {
        console.error('❌ Error loading notifications:', err);
      }
    });
  }

  /**
   * ✅ ทำเครื่องหมายแจ้งเตือนว่า "อ่านแล้ว"
   */
  markAsRead(notificationId: number): void {
    if (!this.userId) return;
  
    this.notificationService.markAsRead(notificationId, this.userId).subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification =>
          notification.NotificationId === notificationId ? { ...notification, IsRead: true } : notification
        );
      },
      error: (err) => {
        console.error('❌ Error marking notification as read:', err);
      }
    });
  }
  

  /**
   * ✅ ลบแจ้งเตือน
   */
  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.NotificationId !== notificationId);
        console.log(`✅ Notification ${notificationId} deleted.`);
      },
      error: (err) => {
        console.error('❌ Error deleting notification:', err);
      }
    });
  }

   // ✅ ฟังก์ชันนำทางไปหน้าตรวจรับ
   navigateToInspection(notification: any): void {
    this.router.navigate(['/inspection'], { queryParams: { id: notification.NotificationId } });
    this.markAsRead(notification.NotificationId); // ✅ อัปเดตเป็นอ่านแล้ว
  }
}
