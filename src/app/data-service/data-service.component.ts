import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, Observable } from 'rxjs';
import { ApiService } from '../ApiController/api-service.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private numberOfAssets!: number;// private assetDetails!: any[];// private assetTypes!: any[];// private assetCategory!: any[];// private userinfo: any = [];
  constructor(private ap: ApiService ,private router : Router) {}

  private assetDetailsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public assetDetails$: Observable<any[]> = this.assetDetailsSubject.asObservable();

  private assetTypesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public assetTypes$: Observable<any[]> = this.assetTypesSubject.asObservable();

  private assetCategorySubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public assetCategory$: Observable<any[]> =this.assetCategorySubject.asObservable();

  private baseUrl = 'https://localhost:7204/api/Users'; // URL หลักของ API
  // private userProfileSubject = new BehaviorSubject<any | null>(null);
  // public userProfile$: Observable<any | null> = this.userProfileSubject.asObservable();

  // private userInfoSubject = new BehaviorSubject<any | null>(null);
  // public userInfo$: Observable<any | null> = this.userInfoSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<any | null>(null);
  public userProfile$: Observable<any | null> = this.userProfileSubject.asObservable().pipe(
    filter(profile => profile !== null) // ✅ ป้องกันค่าที่เป็น null
  );

  private userInfoSubject = new BehaviorSubject<any | null>(null);
  public userInfo$: Observable<any | null> = this.userInfoSubject.asObservable().pipe(
    filter(userInfo => userInfo !== null) // ✅ ป้องกันค่าที่เป็น null
  );

  /**
   * โหลดข้อมูล UserInfo จากเซิร์ฟเวอร์
   */
  async loadUserInfo(): Promise<void> {
    try {
      console.log("🔍 Fetching user info...");
      const data = await firstValueFrom(this.ap.getUserInfos());
      console.log("✅ API Response (User Info):", data);
  
      if (data && data.isAuthenticated) {
        this.userInfoSubject.next(data);
      } else {
        console.warn('⚠️ User is not authenticated!');
        this.userInfoSubject.next(null);
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('❌ Error loading user info:', error);
      this.userInfoSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  /**
   * คืนค่าข้อมูล UserInfo ล่าสุด
   */
  getUserInfo(): any | null {
    return this.userInfoSubject.value;
  }

  /**
   * รีเฟรชข้อมูล UserInfo จากเซิร์ฟเวอร์
   * @returns Promise<void>
   */
  async refreshUserInfo(): Promise<void> {
    await this.loadUserInfo();
  }

  /**
   * อัปเดตข้อมูล UserInfo แบบกำหนดเอง
   * @param newUserInfo ข้อมูลใหม่ที่ต้องการอัปเดต
   */
  updateUserInfo(newUserInfo: any): void {
    this.userInfoSubject.next(newUserInfo);
  }

  /**
   * เคลียร์ข้อมูล UserInfo (เช่น ในกรณี Logout)
   */
  clearUserInfo(): void {
    this.userInfoSubject.next(null);
  }

   /**
   * ดึงข้อมูลโปรไฟล์ผู้ใช้จาก API
   * @param userId ID ของผู้ใช้
   * @returns Observable ที่มีข้อมูลโปรไฟล์ผู้ใช้
   */
   getUserProfile(userId: string): Observable<any> {
    return this.ap.getUserProfile(userId); // ใช้ API Service สำหรับดึงข้อมูล
  }

  /**
   * โหลดข้อมูลโปรไฟล์ผู้ใช้และเก็บไว้ใน BehaviorSubject
   * @param userId ID ของผู้ใช้
   * @returns Promise<void>
   */
  async loadUserProfile(userId: string): Promise<void> {
    try {
      console.log(`🔍 Fetching profile for userId: ${userId}`);
      const profile = await firstValueFrom(this.getUserProfile(userId));
      console.log("✅ API Response (User Profile):", profile);
  
      if (profile) {
        this.userProfileSubject.next(profile);
      } else {
        console.warn("⚠️ Empty profile data received!");
        this.userProfileSubject.next(null);
      }
    } catch (error) {
      console.error('❌ Error loading User Profile:', error);
      this.userProfileSubject.next(null);
    }
  }

  /**
   * คืนค่าข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน
   * @returns ข้อมูลโปรไฟล์ผู้ใช้ (หรือ null ถ้าไม่มีข้อมูล)
   */
  getUserProfileSnapshot(): any | null {
    return this.userProfileSubject.value;
  }

  setNumberOfAssets(value: number): void {
    this.numberOfAssets = value;
  }

  getNumberOfAssets(): number {
    return this.numberOfAssets;
  }

  setAssetDetails(value: any[]): void {
    this.assetDetailsSubject.next(value);
  }

  getAssetDetails(): Observable<any[]> {
    return this.assetDetails$;
  }
  setAssetTypes(value: any[]): void {
    this.assetTypesSubject.next(value);
  }

  getAssetTypes(): Observable<any[]> {
    return this.assetTypes$;
  }

  setAssetCategory(value: any[]): void {
    this.assetCategorySubject.next(value);
  }

  getAssetCategory(): Observable<any[]> {
    return this.assetCategory$;
  }
}
