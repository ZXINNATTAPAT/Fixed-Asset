import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withRouterConfig,
  withInMemoryScrolling,
  withEnabledBlockingInitialNavigation,
  withViewTransitions,
  withHashLocation,
} from '@angular/router';
import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';

// กำหนดค่าสำหรับการใช้งานของแอพพลิเคชั่น
export const appConfig: ApplicationConfig = {
  providers: [
    // Import providers ที่เกี่ยวข้องกับการทำงานร่วมกับ HttpClientModule
    importProvidersFrom(HttpClientModule),
    // กำหนดเส้นทางของแอพพลิเคชั่น
    provideRouter(
      routes,
      // กำหนดการตั้งค่าเส้นทาง
      withRouterConfig({
        onSameUrlNavigation: 'reload', // การรีโหลดหน้าเว็บเมื่อเปลี่ยน URL เดิม
      }),
      // กำหนดการจัดการเมื่อมีการเลื่อนหน้า
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // ตำแหน่งเลื่อนไปที่ด้านบนเมื่อเปลี่ยนเส้นทาง
        anchorScrolling: 'enabled', // เปิดใช้งานการเลื่อนไปยังตำแหน่งสมุดบัญชี
      }),
      // กำหนดการทำงานเมื่อเริ่มต้นแอพพลิเคชั่น
      withEnabledBlockingInitialNavigation(),
      // กำหนดการเปลี่ยนแปลงมุมมอง
      withViewTransitions(),
      // กำหนดการจัดการเมื่อมีการเปลี่ยน hash location
      withHashLocation()
    ),
    // Import providers ที่เกี่ยวข้องกับ DropdownModule และ SidebarModule
    importProvidersFrom(SidebarModule, DropdownModule),
    // กำหนดค่าสำหรับการใช้งานของ IconSetService
    IconSetService,
    // กำหนดค่าสำหรับการใช้งานของ animations
    provideAnimations(),
  ],
};
