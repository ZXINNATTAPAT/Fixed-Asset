import { Component, OnInit } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
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
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/ApiController/api-service.service';

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
  
    this.authService.login(credentials).subscribe(
      (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have successfully logged in!',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          // โหลดข้อมูล UserInfo หลังจากล็อกอินสำเร็จ
          this.authService.getUserInfos().subscribe(
            (userinfo) => {
              this.userinfo = userinfo;
              this.isLoading = false; // หยุด Loading
  
              // ตรวจสอบว่ามีข้อมูล Page ก่อนนำทาง
              if (response && response.page && response.department && response.affiliation) {
                // this.router.navigate([
                //   `/dashboard/${response.affiliation}/${response.department}/${response.page}`,
                // ]);
                // window.location.href = `/dashboard/${response.affiliation}/${response.department}/${response.page}`;
                window.location.href = `/dashboard/${response.affiliation}`;
                
              } else {
                console.error('Page information is missing in the response.');
                Swal.fire({
                  icon: 'error',
                  title: 'Navigation Error',
                  text: 'Unable to navigate to the Dashboard. Please try again.',
                });
              }
            },
            (error) => {
              this.isLoading = false; // หยุด Loading
              console.error('Error loading user info:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unable to load user information. Please try again.',
              });
            }
          );
        });
      },
      (error) => {
        this.isLoading = false; // หยุด Loading
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
