import {ContainerComponent,RowComponent,ColComponent,CardGroupComponent,TextColorDirective,CardComponent,CardBodyComponent,FormDirective,InputGroupComponent,InputGroupTextDirective,FormControlDirective,ButtonDirective,} from '@coreui/angular';
import { NgIf, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,NgIf
  ],
})
export class LoginComponent implements OnInit {
  userinfo: any = [];
  isLoading: boolean = false;

  param: string | null = '';

  username: string = '';
  password: string = '';

  constructor(private authService: ApiService, private router: Router) {}

  ngOnInit(): void {}

  login(event: Event, username: string, password: string): void {
    event.preventDefault(); // ป้องกันการ Reload หน้า
    const credentials = { username, password };
    this.isLoading = true; // เริ่ม Loading
  
    this.authService.authService.login(credentials).subscribe(
      (response: any) => {
        Swal.fire({
          icon: 'success',
          title: '<span style="font-family: Anuphan; font-weight: 700;">เข้าสู่ระบบสำเร็จ</span>',
          html: `<span style="font-family: Anuphan; font-weight: 500;">
            คุณได้เข้าสู่ระบบเรียบร้อยแล้ว!
          </span>`,
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          this.isLoading = false; // ✅ หยุด Loading
    
          if (response && response.affiliation) {
            const dashboardUrl = `/dashboard/${response.affiliation}`;
            console.log(`🔍 Navigating to: ${dashboardUrl}`);
            
            window.location.href = dashboardUrl; // ✅ ใช้ Router แทน window.location.href
          } else {
            console.error('❌ Affiliation information is missing in the response.', response);
            Swal.fire({
              icon: 'error',
              title: 'Navigation Error',
              text: 'Unable to navigate to the Dashboard. Please try again.',
            });
          }
        });
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Login Failed:', error);
    
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid username or password. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    );
  }
  
  
}
