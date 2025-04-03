import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { ICustomNavData, navItems as staticNavItems } from './_nav';// นำเข้าค่า navItems เดิม
import { DataService } from '../../../data-service/data-service.component';
import { CommonModule, NgIf, NgStyle } from '@angular/common';

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
    NgIf,NgStyle,
    CommonModule,
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
  @ViewChild('sidebar1') sidebar1!: any;
  isSidebarNarrow: boolean = false;
  userinfo: any = {};
  userId: string = '' ;
  userProfile: any = {};
  userRole: string[] = [];

  public navItems: ICustomNavData[] = []; // ✅ ใช้ Custom Interface
  public navItemsFiltered: ICustomNavData[] = [];

  constructor(private dataService: DataService ,private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.navItems = staticNavItems; // ✅ โหลดค่า navItems ก่อน
    // console.log("✅ Nav Items Loaded:", this.navItems); // ตรวจสอบว่ามีค่า
    this.initializeUserData();
  }
  ngAfterViewInit() {
    // sync state ครั้งแรก (ป้องกัน error)
    this.isSidebarNarrow = this.sidebar1?.narrow ?? false;
    this.cdRef.detectChanges();
  }
  
  onToggleSidebar(): void {
    this.sidebar1.toggle(); // CoreUI ทำการพับ
    setTimeout(() => {
      this.isSidebarNarrow = this.sidebar1.narrow;
      this.cdRef.detectChanges();
    }, 100); // รอให้ toggle ทำงานก่อนนิดนึง
  }

  private async initializeUserData(): Promise<void> {
    try {
      this.dataService.userInfo$.subscribe(userInfo => {
        if (userInfo) {
          this.userinfo = userInfo.claims;
  
          this.userId = userInfo.userId ?? ''; // ✅ Prevent `undefined`
  
          this.userRole = userInfo.claims.Role ? [userInfo.claims.Role] : []; // ✅ Correct role extraction
  
          // console.log("✅ User Info:", this.userinfo);
  
          if (this.userId) {
            this.loadUserProfile(this.userId);
          }
  
          this.updateNavItems();
        } else {
          console.warn("⚠️ User info is empty!");
        }
      });
    } catch (error) {
      console.error('❌ Error initializing user data:', error);
    }
  }
  
  private updateNavItems() {
    // console.log("🔍 Debug: Checking navItems...", this.navItems);
  
    if (!this.navItems || this.navItems.length === 0) {
      console.error("❌ navItems is empty! Check if it's properly initialized.");
      return;
    }
  
    this.navItemsFiltered = this.navItems.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return item.roles.some(role => this.userRole.includes(role));
    });
  
    // console.log(`🔍 Debug: Filtered Nav Items`, this.navItemsFiltered);
  }
  
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      await this.dataService.userService.loadUserProfile(userId); // ✅ แปลง `userId` เป็น `number`
      this.userProfile = this.dataService.userService.getUserProfileSnapshot();
  
      // console.log(`✅ User Profile Loaded:`, this.userProfile);
    } catch (error) {
      console.error('❌ Error loading User Profile:', error);
    }
  }
  
  onScrollbarUpdate(event: any): void {
    // console.log("🖱️ Scrollbar updated:", event);
  }

  
  

  

  
}
