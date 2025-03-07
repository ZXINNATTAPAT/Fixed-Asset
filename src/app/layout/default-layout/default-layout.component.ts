import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  INavData,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems as staticNavItems } from './_nav';// นำเข้าค่า navItems เดิม
import { DataService } from '@services/data-service.component';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent
  ]
})
export class DefaultLayoutComponent implements OnInit {
  userinfo: any = [];
  userId:any = '';
  userProfile: any = [];

  public navItems: INavData[] = [];

  constructor(private dataService : DataService) {
    this.updateNavItems();
  }

  ngOnInit(): void {this.initializeUserData();}
  
  private async initializeUserData(): Promise<void> {
    try {
      // Subscribe to userInfo$ to get real-time updates
      this.dataService.userInfo$.subscribe((userInfo) => {
        if (userInfo) {
          this.userinfo = userInfo.claims;
          this.userId = userInfo.userId;
          // console.log('UserInfo Loaded:', this.userinfo);
  
          // โหลด UserProfile เมื่อ userId พร้อม
          if (this.userId) {
            const userId = this.userId ;
            this.loadUserProfile(userId);
          } else {
            // console.warn('UserId not found in UserInfo');
          }
        } else {
          // console.warn('UserInfo is not available.');
        }
      });
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }
  
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      // เรียกใช้ `DataService` เพื่อโหลดข้อมูลโปรไฟล์
      await this.dataService.loadUserProfile(userId);
  
      // ดึงข้อมูลจาก BehaviorSubject
      this.userProfile = this.dataService.getUserProfileSnapshot();
  
      if (this.userProfile) {
        // console.log('User Profile Loaded:', this.userProfile);
      } else {
        console.warn('User Profile is not available.');
      }
    } catch (error) {
      console.error('Error loading User Profile:', error);
    }
  }
  
  private updateNavItems() {
    // กำหนดค่าพารามิเตอร์จาก userinfo
    const workgroup = this.userinfo?.workgroup ;
  
    // สร้าง navItems ใหม่โดยแทนที่ dynamic parameter
    this.navItems = staticNavItems.map((item) => {
      if (item.children) {
        // อัปเดต URL ใน children
        item.children = item.children.map((child) => {
          if (typeof child.url === 'string' && child.url.includes('$param')) {
            return {
              ...child,
              url: child.url.replace('$param', workgroup),
            };
          }
          return child;
        });
      }
      return item;
    });
  }

  onScrollbarUpdate($event: any) {
    // โค้ดสำหรับ Scrollbar (ตามต้องการ)
  }

  
}
