import { Component } from '@angular/core';
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
import { jwtDecode } from 'jwt-decode';

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
export class DefaultLayoutComponent {
  userinfo: any = [];
  token: any;
  public navItems: INavData[] = [];

  constructor() {
    this.readinfo();
    this.updateNavItems();
  }

  public readinfo() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      const decodedToken = jwtDecode(this.token);
      this.userinfo = decodedToken;
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
