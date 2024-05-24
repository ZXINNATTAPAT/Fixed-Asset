import { Component, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms'; // Import FormsModules
import Swal from 'sweetalert2';
import axios from 'axios';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle]
})
export class LoginComponent implements OnInit {
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http;
  }

  async login(event: Event, username: string, password: string) {
    event.preventDefault();
    const credentials = { username, password };

    try {
        const response = await axios.post<any>('https://localhost:7204/api/Authorization', credentials);
        // console.log(response.data);

        // แสดงการแจ้งเตือนเมื่อเข้าสู่ระบบสำเร็จ
        Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'You have successfully logged in!',
            showConfirmButton: false,
            timer: 1500
        });

        // เก็บ token ใน localStorage
        localStorage.setItem('token', response.data);

        // นำผู้ใช้ไปที่หน้าดashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500); // รอการแจ้งเตือนแสดงเสร็จ
    } catch (error) {
        console.error(error);

        // แสดงการแจ้งเตือนเมื่อเข้าสู่ระบบไม่สำเร็จ
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid username or password. Please try again.',
            confirmButtonText: 'OK'
        });
    }
}

}