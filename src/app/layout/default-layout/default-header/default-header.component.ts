import {Component,DestroyRef,Injectable,Input,OnInit,} from '@angular/core';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownModule,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  SidebarToggleDirective,
  TextColorDirective,
  ThemeDirective,
} from '@coreui/angular';
import { CommonModule, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, filter, map, tap } from 'rxjs/operators';
import { cilAccountLogout, cilUser } from '@coreui/icons';
import CountyData from './County.json';
import { HttpClient } from '@angular/common/http';
// import { json } from 'stream/consumers';
import { ApiService } from '../../../../ApiController/api-service.service';
import { DataService } from '../../../../data-service/data-service.component';
import { navItems, INavData } from '../_nav';
import { NotificationService } from '../../../services/notification.service';
import { firstValueFrom } from 'rxjs';

interface povice {
  id: number;
  name_th: string;
}

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    NgIf,NgStyle,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    ThemeDirective,
    DropdownModule,
    DropdownComponent,
    DropdownToggleDirective,
    TextColorDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    BadgeComponent,
    DropdownDividerDirective,
    ProgressBarDirective,
    ProgressComponent,
    CommonModule
  ],
})

export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  @Input() sidebarId: string = 'sidebar1';

  icons = { cilAccountLogout, cilUser };
  navItemsFiltered: INavData[] = [];
  userinfo: any = {};
  userRoles: string[] = []; // ✅ เก็บ Roles ของผู้ใช้
  province: any[] = [];
  provinceset: any[] = [];
  showCounty: any = {};
  colorMode: any;

  notifications: any[] = []; // ✅ ตัวแปรเก็บรายการแจ้งเตือน
  unreadCount: number = 0; // ✅ จำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
  dropdownOpen: boolean = false; // ✅ เปิด/ปิด Dropdown แจ้งเตือน
  userId: string = ''; // ✅ เก็บ User ID

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private colorModeService: ColorModeService,
    private destroyRef: DestroyRef,
    // private authService: ApiService,
    // private cookieService: CookieService, // ✅ Inject CookieService
    private dataService: DataService,
    private notificationService: NotificationService, // ✅ Inject Notification Service
    private router : Router,
    private apiService :ApiService
  ) { 
    super();
  }

  ngOnInit(): void {
    // ✅ รอให้ userInfo โหลดเสร็จ ก่อนจะโหลดแจ้งเตือน
    this.dataService.userInfo$.subscribe((userInfo) => {
      if (userInfo?.claims) {
        this.userinfo = userInfo.claims;
        this.userRoles = Array.isArray(userInfo.claims.Role) ? userInfo.claims.Role : [userInfo.claims.Role]; // ✅ เก็บ roles ของ user
        this.userId = userInfo?.userId || '';


        // ✅ โหลดแจ้งเตือนหลังจากที่ userId ได้รับค่าแล้ว
        if (this.userId) {
          console.log(`✅ User ID Loaded: ${this.userId} ${this.userRoles}`);
          this.loadNotifications();
        } else {
          console.warn('⚠️ User ID is empty, skipping notification load.');
        }

        this.filterNavItems();
      }
    });

    this.colorModeService.localStorageItemName.set(
      'coreui-free-angular-admin-template-theme-default'
    );
    this.colorModeService.eventName.set('ColorSchemeChange');

    this.activatedRoute.queryParams.pipe(
      delay(1),
      map((params) => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
      filter((theme) => ['dark', 'light', 'auto'].includes(theme)),
      tap((theme) => {
        this.colorModeService.colorMode.set(theme);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.setshow();
  }

  // ✅ โหลดแจ้งเตือนของผู้ใช้
  loadNotifications(): void {
    if (!this.userId) return; // ✅ ป้องกัน Error กรณีไม่มี User ID

    this.notificationService.getNotifications(Number(this.userId)).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.IsRead).length; // ✅ ใช้ IsRead แทน Status === 'new'
      },
      error: (err) => {
        console.error('❌ Error loading notifications:', err);
      }
    });
  }

  // ✅ อัปเดตสถานะเป็น "อ่านแล้ว"
  markAsRead(notificationId: number): void {
    if (!this.userId) return; // ✅ ป้องกัน Error กรณีไม่มี User ID

    this.notificationService.markAsRead(notificationId, Number(this.userId)).subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification =>
          notification.NotificationId === notificationId ? { ...notification, IsRead: true } : notification
        );
        this.unreadCount = this.notifications.filter(n => !n.IsRead).length; // ✅ อัปเดต unreadCount
      },
      error: (err) => {
        console.error('❌ Error marking notification as read:', err);
      }
    });
  }

  // ✅ เปิด/ปิด dropdown แจ้งเตือน
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

    // ✅ ฟังก์ชันกรองเมนูตามสิทธิ์ของผู้ใช้
    filterNavItems() {
      // console.log("🔍 User Roles:", this.userRoles);
      
      if (!this.userRoles || this.userRoles.length === 0) {
        this.navItemsFiltered = []; // ❌ ถ้าไม่มี roles เลย ให้ซ่อนเมนูทั้งหมด
        return;
      }
    
      this.navItemsFiltered = navItems.filter(menu => {
        // console.log(`🔎 Checking Menu: ${menu.name} | Roles: ${menu.roles}`);
    
        return menu.roles?.some(role => this.userRoles.includes(role));
      });
    
      console.log("✅ Filtered Nav Items:", this.navItemsFiltered);
    }
    

  setshow() {
    this.http
      .get<any>('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json')
      .subscribe(
        (response) => {
          this.province = response;
          this.provinceset = this.province.map((item) => ({
            id: item.id,
            name_th: item.name_th,
          }));

          for (const county of CountyData.codecounty) {
            if (this.userinfo.Affiliation !== 'ส่วนกลาง') {
              if (this.userinfo.Affiliation === county.name_th) {
                const matchedProvinces = this.provinceset.filter(
                  (province) => county.id === province.id
                );
                this.showCounty = matchedProvinces.length > 0 ? matchedProvinces[0].name_th : 'Error';
                return;
              }
            } else {
              this.showCounty = 'ส่วนกลาง';
            }
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  // ✅ ฟังก์ชัน Logout
  Logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        console.log('✅ Logged out from server.');
  
        // ✅ ลบคุกกี้ที่สามารถลบได้ (แต่ `HttpOnly` ต้องให้ Backend ลบ)
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.split("=");
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
  
        // ✅ รีเฟรชหน้าไปที่ `/login` เพื่อล้าง session
        this.router.navigate(['/login']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        console.error('❌ Logout API failed:', err);
      }
    });
  }
  
  
}

