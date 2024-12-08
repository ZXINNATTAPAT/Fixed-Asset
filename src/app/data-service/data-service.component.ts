import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { ApiService } from '../ApiController/api-service.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private numberOfAssets!: number;
  // private assetDetails!: any[];
  // private assetTypes!: any[];
  // private assetCategory!: any[];
  // private userinfo: any = [];
  constructor(private ap: ApiService) {}

  private assetDetailsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public assetDetails$: Observable<any[]> = this.assetDetailsSubject.asObservable();

  private assetTypesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public assetTypes$: Observable<any[]> = this.assetTypesSubject.asObservable();

  private assetCategorySubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public assetCategory$: Observable<any[]> =this.assetCategorySubject.asObservable();

  private userInfoSubject = new BehaviorSubject<any | null>(null);
  public userInfo$: Observable<any | null> = this.userInfoSubject.asObservable();

  /**
   * โหลดข้อมูล UserInfo จากเซิร์ฟเวอร์
   */
  async loadUserInfo(): Promise<void> {
    try {
      const data = await firstValueFrom(this.ap.getUserInfos()); // ใช้ firstValueFrom เพื่อรอ Observable
      this.userInfoSubject.next(data); // ส่งข้อมูลไปยัง Subject
    } catch (error) {
      console.error('Error loading user info:', error);
      this.userInfoSubject.next(null); // กรณีเกิดข้อผิดพลาด
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
