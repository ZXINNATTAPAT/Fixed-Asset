import { NgStyle } from '@angular/common';
import {Component,OnInit,} from '@angular/core';
import { WidgetsBrandComponent } from '@widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '@widgets/widgets-dropdown/widgets-dropdown.component';

import { TablewigetComponent } from './tablewiget/tablewiget.component';
import { Tablewiget2Component } from './tablewiget2/tablewiget2.component';
import { Tablewiget3Component } from './tablewiget3/tablewiget3.component';
import { Tablewiget4Component } from './tablewiget4/tablewiget4.component';
import { Tablewidget5Component } from './tablewiget5/tablewidget5.component';
import { DataService } from '../data-service/data-service.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../ApiController/api-service.service';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    WidgetsDropdownComponent,
    NgStyle,
    WidgetsBrandComponent,
    TablewigetComponent,
    Tablewiget2Component,
    Tablewiget3Component,
    Tablewiget4Component,
    Tablewidget5Component,
  ],
})

export class DashboardComponent implements OnInit {

  userinfo: any = [];
  assetDetails: any = [];
  assetcom: string = '';
  numberOfAssets!: number;
  param: string | null = '';
  param2: string | null = '';
  param3: string | null = '';

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router ,private authService :ApiService) 
  { 
    
  }

  
  ngOnInit(): void {
    this.dataService.userInfo$.subscribe((userInfo) => {
      this.userinfo = userInfo;
      console.log('DefaultHeader UserInfo:', userInfo);
    });
  }
  
  // ฟังก์ชันจัดการพารามิเตอร์
  handleParam(): void {
    // ดึงพารามิเตอร์จาก URL
    // this.param = this.route.snapshot.paramMap.get('angency');
    // console.log('URL Parameter:', this.param);
  
    if (!this.param) {
      // ถ้าไม่มีพารามิเตอร์ใน URL
      if (this.userinfo?.Faction) {
        // ถ้ามี Faction ใน userinfo
        this.param = this.userinfo.Faction;
        this.param2 = this.userinfo.Affiliation;
        this.param3 = this.userinfo.Department;
        console.log('Setting param from userinfo:', this.param);
  
        // เปลี่ยนเส้นทางโดยใช้ Angular Router
        this.router.navigate([`/dashboard/${this.param2}/${this.param3}/${this.param}`]).then(() => {
          console.log('Navigation successful to:', `/dashboard/${this.param}`);
        }).catch((err) => {
          console.error('Navigation error:', err);
        });
  
        return; // หยุดการทำงานใน handleParam หลังเปลี่ยนเส้นทาง
      } else {
        console.error('No URL parameter or Faction found in userinfo!');
        return; // หยุดการทำงานหากไม่มีพารามิเตอร์หรือ Faction
      }
    }
  
    // ถ้ามีพารามิเตอร์ใน URL
    console.log('Received parameter from URL:', this.param);
  
    // เรียกใช้งาน DataService เพื่อดึงจำนวน assets
    // this.numberOfAssets = this.dataService.getNumberOfAssets();
  }
  
  
  
}  