import {
  Component,
  DestroyRef,
  inject,
  Injectable,
  Input,
  OnInit,
} from '@angular/core';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
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
import { NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, filter, map, tap } from 'rxjs/operators';
import { cilAccountLogout, cilUser } from '@coreui/icons';
import { jwtDecode } from 'jwt-decode';
import CountyData from './County.json';
import { HttpClient } from '@angular/common/http';
import { json } from 'stream/consumers';

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
    NgIf,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    ThemeDirective,
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
    NgStyle,
  ],
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  icons = { cilAccountLogout, cilUser };

  userinfo: any = [];
  token: any;

  province: povice[] = [];

  provinceset: any[] = [];

  showCounty: any = {};

  coutcounty: any[] = [];

  colorMode: any;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private colorModeService: ColorModeService,
    private destroyRef: DestroyRef
  ) {
    super();
  }

  ngOnInit() {
    this.colorModeService.localStorageItemName.set(
      'coreui-free-angular-admin-template-theme-default'
    );
    this.colorModeService.eventName.set('ColorSchemeChange');

    this.activatedRoute.queryParams
      .pipe(
        delay(1),
        map((params) => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter((theme) => ['dark', 'light', 'auto'].includes(theme)),
        tap((theme) => {
          this.colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.readinfo();

    this.setshow();
  }

  readinfo() {
    this.token = localStorage.getItem('token');
    const decodedToken = jwtDecode(this.token);
    this.userinfo = decodedToken;
    console.log(this.userinfo);
  }
  setshow() {
    this.http
      .get<any>(
        'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json'
      )
      .subscribe(
        (response) => {
          this.province = response;
          this.provinceset = this.province.map((item) => ({
            id: item.id,
            name_th: item.name_th,
          }));
          console.log(this.provinceset);
          console.log(CountyData.codecounty);

          for (const county of CountyData.codecounty) {
            if (this.userinfo.affiliation.toString() !== 'กกต.สกล') {
              // ตรวจสอบเงื่อนไขของการเปรียบเทียบชื่อ
              if (this.userinfo.affiliation.toString() === county.name_th) {
                console.log('Found matching affiliation:', county);
                // หาข้อมูลจังหวัดที่มีการจับคู่กับเขตปัจจุบัน
                const matchedProvinces = this.provinceset.filter(
                  (province) => county.id === province.id
                );
                if (matchedProvinces.length > 0) {
                  // หากพบข้อมูลจังหวัดที่มีการจับคู่กับเขตปัจจุบัน กำหนดค่า showCounty เป็นชื่อจังหวัดแรกที่ match ได้
                  this.showCounty = matchedProvinces[0].name_th;
                } else {
                  // หากไม่พบข้อมูลจังหวัดที่มีการจับคู่กับเขตปัจจุบัน กำหนดค่าเริ่มต้น
                  this.showCounty = 'Error';
                }
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

  Logout(): void {
    localStorage.clear();
    window.location.reload();
  }

  @Input() sidebarId: string = 'sidebar1';

  // public newMessages = [
  //   {
  //     id: 0,
  //     from: 'Jessica Williams',
  //     avatar: '7.jpg',
  //     status: 'success',
  //     title: 'Urgent: System Maintenance Tonight',
  //     time: 'Just now',
  //     link: 'apps/email/inbox/message',
  //     message:
  //       "Attention team, we'll be conducting critical system maintenance tonight from 10 PM to 2 AM. Plan accordingly...",
  //   },
  //   {
  //     id: 1,
  //     from: 'Richard Johnson',
  //     avatar: '6.jpg',
  //     status: 'warning',
  //     title: 'Project Update: Milestone Achieved',
  //     time: '5 minutes ago',
  //     link: 'apps/email/inbox/message',
  //     message:
  //       "Kudos on hitting sales targets last quarter! Let's keep the momentum. New goals, new victories ahead...",
  //   },
  //   {
  //     id: 2,
  //     from: 'Angela Rodriguez',
  //     avatar: '5.jpg',
  //     status: 'danger',
  //     title: 'Social Media Campaign Launch',
  //     time: '1:52 PM',
  //     link: 'apps/email/inbox/message',
  //     message:
  //       'Exciting news! Our new social media campaign goes live tomorrow. Brace yourselves for engagement...',
  //   },
  //   {
  //     id: 3,
  //     from: 'Jane Lewis',
  //     avatar: '4.jpg',
  //     status: 'info',
  //     title: 'Inventory Checkpoint',
  //     time: '4:03 AM',
  //     link: 'apps/email/inbox/message',
  //     message:
  //       "Team, it's time for our monthly inventory check. Accurate counts ensure smooth operations. Let's nail it...",
  //   },
  //   {
  //     id: 3,
  //     from: 'Ryan Miller',
  //     avatar: '4.jpg',
  //     status: 'info',
  //     title: 'Customer Feedback Results',
  //     time: '3 days ago',
  //     link: 'apps/email/inbox/message',
  //     message:
  //       "Our latest customer feedback is in. Let's analyze and discuss improvements for an even better service...",
  //   },
  // ];

  // public newNotifications = [
  //   {
  //     id: 0,
  //     title: 'New user registered',
  //     icon: 'cilUserFollow',
  //     color: 'success',
  //   },
  //   { id: 1, title: 'User deleted', icon: 'cilUserUnfollow', color: 'danger' },
  //   {
  //     id: 2,
  //     title: 'Sales report is ready',
  //     icon: 'cilChartPie',
  //     color: 'info',
  //   },
  //   { id: 3, title: 'New client', icon: 'cilBasket', color: 'primary' },
  //   {
  //     id: 4,
  //     title: 'Server overloaded',
  //     icon: 'cilSpeedometer',
  //     color: 'warning',
  //   },
  // ];

  // public newStatus = [
  //   {
  //     id: 0,
  //     title: 'CPU Usage',
  //     value: 25,
  //     color: 'info',
  //     details: '348 Processes. 1/4 Cores.',
  //   },
  //   {
  //     id: 1,
  //     title: 'Memory Usage',
  //     value: 70,
  //     color: 'warning',
  //     details: '11444GB/16384MB',
  //   },
  //   {
  //     id: 2,
  //     title: 'SSD 1 Usage',
  //     value: 90,
  //     color: 'danger',
  //     details: '243GB/256GB',
  //   },
  // ];

  // public newTasks = [
  //   { id: 0, title: 'Upgrade NPM', value: 0, color: 'info' },
  //   { id: 1, title: 'ReactJS Version', value: 25, color: 'danger' },
  //   { id: 2, title: 'VueJS Version', value: 50, color: 'warning' },
  //   { id: 3, title: 'Add new layouts', value: 75, color: 'info' },
  //   { id: 4, title: 'Angular Version', value: 100, color: 'success' },
  // ];
}
