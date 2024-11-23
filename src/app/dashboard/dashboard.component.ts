import { NgStyle } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { WidgetsBrandComponent } from '@widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '@widgets/widgets-dropdown/widgets-dropdown.component';
import { AssetTableComponent } from '../views/main_system/asset-table/asset-table.component';

import { TablewigetComponent } from './tablewiget/tablewiget.component';
import { Tablewiget2Component } from './tablewiget2/tablewiget2.component';
import { Tablewiget3Component } from './tablewiget3/tablewiget3.component';
import { Tablewiget4Component } from './tablewiget4/tablewiget4.component';
import { Tablewidget5Component } from './tablewiget5/tablewidget5.component';
import { DataService } from '../data-service/data-service.component';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    WidgetsDropdownComponent,
    NgStyle,
    WidgetsBrandComponent,
    AssetTableComponent,
    TablewigetComponent,
    Tablewiget2Component,
    Tablewiget3Component,
    Tablewiget4Component,
    Tablewidget5Component
  ],
})

export class DashboardComponent implements OnInit {

  userinfo: any = [];
  token: any;

  readinfo() {
    this.token = localStorage.getItem('token');
    const decodedToken = jwtDecode(this.token);
    this.userinfo = decodedToken;
    // console.log(this.userinfo);
  }

  assetDetails: any = [];
  assetcom: string = '';
  numberOfAssets!: number;
  param: string | null = '';

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.readinfo(); // อ่านข้อมูล userinfo
  
    // ดึงพารามิเตอร์จาก URL
    this.param = this.route.snapshot.paramMap.get('angency');
    console.log(this.param)
  
    if (!this.param) {
      // ถ้าไม่มีพารามิเตอร์ใน URL
      if (this.userinfo?.workgroup) {
        // ถ้ามี workgroup ใน userinfo
        this.param = this.userinfo.workgroup;
  
        // เปลี่ยนเส้นทางโดยใช้ Angular Router
        this.router.navigate([`/dashboard/${this.param}`]);
        return; // หยุดการทำงานใน ngOnInit หลังเปลี่ยนเส้นทาง
      } else {
        console.error('No param or workgroup found!');
        return; // หยุดการทำงานหากไม่มีพารามิเตอร์หรือ workgroup
      }
    }
  
    // ถ้ามีพารามิเตอร์ใน URL
    console.log('Received parameter from URL:', this.param);
  
    // เรียกใช้งาน DataService เพื่อดึงจำนวน assets
    this.numberOfAssets = this.dataService.getNumberOfAssets();
  }
  
  
}  