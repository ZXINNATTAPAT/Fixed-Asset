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
    return this.authService.getAuthStatus().pipe(
      map(response => {
        // console.log("🔍 Auth Status:", response);
  
        // ✅ ป้องกันกรณี `route.data.roles` เป็น undefined
        const allowedRoles = (route.data?.['roles'] as string[]) || [];
        // console.log("🔍 Allowed Roles:", allowedRoles);
  
        if (allowedRoles.length === 0) {
          // console.warn("⚠️ No roles defined for this route! Access granted by default.");
          // window.location.href = '/login'
          return true;
        }
  
        // ✅ แปลง Role เป็น lowercase เพื่อป้องกัน Case-Sensitive ปัญหา
        const userRoles = (Array.isArray(response.roles) ? response.roles : [response.roles])
        .map((role: string) => role.toLowerCase());
      const requiredRoles = allowedRoles.map(role => role.toLowerCase());
  
        if (response.isAuthenticated && userRoles.some(role => requiredRoles.includes(role))) {
          console.log("✅ Access Granted!");
          return true;
        } else {
          console.warn("❌ Access Denied! Redirecting to login...");
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(error => {
        console.error("❌ Auth Error:", error);
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
  
  
  
  
  
}
