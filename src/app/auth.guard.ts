import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ApiService } from './api-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: ApiService) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      map((isLoggedIn) => {
        if (isLoggedIn) {
          return true; // ผู้ใช้ล็อกอินอยู่
        } else {
          // ผู้ใช้ไม่ได้ล็อกอิน
          Swal.fire({
            title: 'โปรดทำการ Login',
            icon: 'error',
          });
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        // กรณีเกิดข้อผิดพลาด เช่น เซิร์ฟเวอร์ไม่ตอบสนอง
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถตรวจสอบสถานะการล็อกอินได้',
          icon: 'error',
        });
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
}
