import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DataService } from '../../data-service/data-service.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgClass, RouterLink],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  userId: number | null = null;

  private notificationService = inject(NotificationService);
  private dataService = inject(DataService);
  private router = inject(Router);

  ngOnInit(): void {
    this.dataService.userInfo$.subscribe({
      next: (userInfo) => {
        this.userId = userInfo?.userId ? Number(userInfo.userId) : null;
        if (this.userId) {
          this.loadNotifications();
        }
      },
      error: (err) => {
        console.error("❌ Error fetching user info:", err);
      }
    });
  }

  loadNotifications(): void {
    if (!this.userId) return;

    this.notificationService.getNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => {
        console.error('❌ Error loading notifications:', err);
      }
    });
  }

  markAsRead(notificationId: number): void {
    if (!this.userId) return;

    this.notificationService.markAsRead(notificationId, this.userId).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => n.NotificationId === notificationId ? { ...n, IsRead: true } : n);
        this.notifications = this.notifications.filter(n => n.NotificationId !== notificationId);
      },
      error: (err) => {
        console.error('❌ Error marking notification as read:', err);
      }
    });
  }

  onNotificationClick(notification: any): void {
    this.markAsRead(notification.NotificationId);
    this.router.navigate(['/inspection'], { queryParams: { id: notification.NotificationId } });
  }
}
