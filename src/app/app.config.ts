import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {provideRouter,withRouterConfig,withInMemoryScrolling,withEnabledBlockingInitialNavigation,withViewTransitions,withHashLocation,} from '@angular/router';
import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CacheInterceptor } from './ApiController/interceptors/cache.interceptor'

// กำหนดค่าสำหรับการใช้งานของแอพพลิเคชั่น
export const appConfig: ApplicationConfig = {
  providers: [
    // Import HttpClientModule เพื่อรองรับ HTTP Requests
    importProvidersFrom(HttpClientModule),

    // กำหนดเส้นทางและตั้งค่า Routing
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload', // รีโหลดหน้าเมื่อ URL ซ้ำเดิม
      }),
      withInMemoryScrolling({scrollPositionRestoration: 'top', // คืนค่า Scroll Position ด้านบน
        anchorScrolling: 'enabled', // เปิดใช้งานการเลื่อนไปยัง Anchor
      }),

      withEnabledBlockingInitialNavigation(), // บล็อค Navigation เริ่มต้นจนกว่าโหลดเสร็จ

      withViewTransitions(), // เปิดใช้งาน View Transitions

      // withHashLocation() // ใช้ Hash-based Navigation (#)
    ),

    // Import SidebarModule และ DropdownModule
    importProvidersFrom(SidebarModule, DropdownModule),

    // กำหนด IconSetService เพื่อใช้ Icon
    IconSetService,

    // เปิดใช้งาน Animation
    provideAnimations(),


    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor, // เพิ่ม Interceptor ที่ต้องการ
      multi: true, // รองรับหลาย Interceptor
    },
    

  ],
};
