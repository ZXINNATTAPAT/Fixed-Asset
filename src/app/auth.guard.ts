import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ApiService } from './ApiController/api-service.service';

@Injectable({providedIn: 'root'})

export class AuthGuard implements CanActivate {
  constructor(
    private router: Router, 
    private authService: ApiService) {}
  
  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      map((isLoggedIn) => {
        if (isLoggedIn) { return true;} // ผู้ใช้ล็อกอินอยู่
        else {
          Swal.fire({ title: 'โปรดทำการ Login',icon: 'error',});// ผู้ใช้ไม่ได้ล็อกอิน
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

  // canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
  //   return this.authService.getUserRole().pipe(
  //     map((userRole) => {
  //       const allowedRoles = route.data['roles'] as Array<string>;
  //       if (userRole.roles.some(role => allowedRoles.includes(role))) {
  //         return true;
  //       } else {
  //         Swal.fire({
  //           title: 'ไม่มีสิทธิ์เข้าถึง',
  //           text: 'คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้',
  //           icon: 'error',
  //         });
  //         this.router.navigate(['/dashboard']); // รีไดเรกไปหน้าหลัก
  //         return false;
  //       }
  //     }),
  //     catchError(() => {
  //       Swal.fire({
  //         title: 'เกิดข้อผิดพลาด',
  //         text: 'ไม่สามารถตรวจสอบสิทธิ์ได้',
  //         icon: 'error',
  //       });
  //       this.router.navigate(['/login']);
  //       return [false];
  //     })
  //   );
  // }
}
