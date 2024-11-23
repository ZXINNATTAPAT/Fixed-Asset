import { Component, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
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
import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms'; // Import FormsModules
import Swal from 'sweetalert2';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

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
    NgStyle,
  ],
})
export class LoginComponent implements OnInit {
  userinfo: any = [];
  param: string | null = '';
  token: string | null = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  async login(event: Event, username: string, password: string) {
    event.preventDefault();
    const credentials = { username, password };

    try {
      const response = await axios.post<any>(
        'https://localhost:7204/api/Authorization',
        credentials
      );

      // ตรวจสอบว่ามี token ใน response
      if (response.data) {
        // เก็บ token ใน localStorage
        localStorage.setItem('token', response.data);

        // Decode token
        this.token = response.data;
        const decodedToken: any = jwtDecode(this.token!);
        this.userinfo = decodedToken;


        // ดึง workgroup จาก token
        this.param = this.userinfo?.workgroup;

        // แสดงการแจ้งเตือนเมื่อเข้าสู่ระบบสำเร็จ
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have successfully logged in!',
          showConfirmButton: false,
          timer: 1000,
        });

        // นำผู้ใช้ไปที่หน้าดashboard
        setTimeout(() => {
          this.router.navigate([`/dashboard/${this.param}`]);
        }, 1500); // รอการแจ้งเตือนแสดงเสร็จ
      } else {
        throw new Error('Token not received');
      }
    } catch (error) {
      console.error(error);

      // แสดงการแจ้งเตือนเมื่อเข้าสู่ระบบไม่สำเร็จ
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid username or password. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  }
}