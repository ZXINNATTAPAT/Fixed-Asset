import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ApiService } from '../ApiController/apiservice/api-service.service';

@Injectable({providedIn: 'root'})

export class AuthGuard implements CanActivate {
  constructor(
    private router: Router, 
    private authService: ApiService) {}
  
  // canActivate(): Observable<boolean> {
  //   return this.authService.isLoggedIn().pipe(
  //     map((isLoggedIn) => {
  //       if (isLoggedIn) { return true; } // ผู้ใช้ล็อกอินอยู่
  //       else {
  //         Swal.fire({ title: 'โปรดทำการ Login', icon: 'error',});// ผู้ใช้ไม่ได้ล็อกอิน
  //         this.router.navigate(['/login']);
  //         return false;
  //       }
  //     }),
  //     catchError((error) => {
  //       // กรณีเกิดข้อผิดพลาด เช่น เซิร์ฟเวอร์ไม่ตอบสนอง
  //       Swal.fire({
  //         title: 'เกิดข้อผิดพลาด',
  //         text: 'ไม่สามารถตรวจสอบสถานะการล็อกอินได้',
  //         icon: 'error',
  //       });
  //       this.router.navigate(['/login']);
  //       return [false];
  //     })
  //   );
  // }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.authService.getAuthStatus().pipe(
      map(response => {
        const allowedRoles = (route.data?.['roles'] as string[]) || [];

        if (allowedRoles.length === 0) {
          return true;
        }

        const userRoles = (Array.isArray(response.roles) ? response.roles : [response.roles])
          .map((role: string) => role.toLowerCase());
        const requiredRoles = allowedRoles.map(role => role.toLowerCase());

        const hasPermission = response.isAuthenticated && userRoles.some(role => requiredRoles.includes(role));

        if (hasPermission) {
          console.log("✅ Access Granted!");
          return true;
        } else {
          console.warn("❌ Access Denied! Redirecting...");
          // เพิ่มกรณี dashboard ให้ redirect ไป assettable
          if (route.routeConfig?.path?.startsWith('dashboard')) {
            this.router.navigate(['/table/assettable']);
          } else {
            this.router.navigate(['/login']);
          }
          return false;
        }
      }),
      catchError(error => {
        console.error("❌ Auth Error:", error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
  
  
  
  
  
}
