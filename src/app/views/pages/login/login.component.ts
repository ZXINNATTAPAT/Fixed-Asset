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
import { ApiService } from 'src/app/api-service.service';

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

  username: string = '';
  password: string = '';

  constructor(private authService: ApiService, private router: Router) {}

  ngOnInit(): void {}

  login(event: Event, username: string, password: string): void {
    event.preventDefault(); // ป้องกันการ Reload หน้า
    const credentials = { username, password };

    this.authService.login(credentials).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have successfully logged in!',
          timer: 1000,
          showConfirmButton: false,
        });
        this.router.navigate(['/dashboard']); // นำผู้ใช้ไปหน้า Dashboard
      },
      (error) => {
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
