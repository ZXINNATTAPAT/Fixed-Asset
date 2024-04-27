import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      if (this.isTokenValid(token)) {
        // Token ยังไม่หมดอายุ
        return true;
      } else {
        // Token หมดอายุ
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      // ไม่มี Token ใน localStorage
      this.router.navigate(['/login']);
      return false;
    }
  }

  // เช็ค Token ว่ายังไม่หมดอายุหรือไม่
  private isTokenValid(token: string): boolean {
    // Decode Token เพื่อให้สามารถเข้าถึงข้อมูลใน Token ได้
    const decodedToken: any = jwtDecode(token);

    // หากไม่มีข้อมูลเวลาหมดอายุใน Token หรือถ้ามีการระบุเวลาหมดอายุเป็น null หรือ undefined
    // ให้ถือว่า Token ถูกกำหนดให้ไม่มีการหมดอายุ
    if (!decodedToken.exp) return true;

    // ดึงเวลาหมดอายุในรูปแบบ Unix Timestamp (วินาที)
    const expirationTime: number = decodedToken.exp;

    // ดึงเวลาปัจจุบันในรูปแบบ Unix Timestamp (วินาที)
    const currentTime: number = Math.floor(Date.now() / 1000);

    // เปรียบเทียบเวลาปัจจุบันกับเวลาหมดอายุ
    return expirationTime >= currentTime;
  }
}
