import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs';
import { ApiService } from '../ApiController/api-service.service';
import { Router } from '@angular/router';

// ✅ สร้าง interface เพื่อกำหนดโครงสร้าง UserInfo
export interface UserInfo {
  userId: string;
  claims: {
    UserId: string;
    Username: string;
    Role: string;
    DepartmentId: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  private userIdSubject = new BehaviorSubject<number | null>(null);
  private userProfileSubject = new BehaviorSubject<any | null>(null); // ✅ เพิ่มตัวแปรนี้

  // ✅ กำหนดประเภทข้อมูลให้แน่นอน
  public userInfo$: Observable<UserInfo | null> = this.userInfoSubject.asObservable().pipe(
    filter(userInfo => userInfo !== null)
  );

  public userId$: Observable<number | null> = this.userIdSubject.asObservable().pipe(
    filter(userId => userId !== null)
  );

  public userProfile$: Observable<any | null> = this.userProfileSubject.asObservable().pipe(
    filter(profile => profile !== null)
  );

  constructor(private apiService: ApiService, private router: Router) { }

  async loadUserInfo(): Promise<void> {
    try {
      console.log("🔍 Fetching user info...");
      const data = await firstValueFrom(this.apiService.getUserInfos());

      if (data?.isAuthenticated) {
        this.userInfoSubject.next(data);
        this.userIdSubject.next(data.claims?.userId || null);
      } else {
        console.warn('⚠️ User is not authenticated!');
        this.userInfoSubject.next(null);
        this.userIdSubject.next(null);
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('❌ Error loading user info:', error);
      this.userInfoSubject.next(null);
      this.userIdSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }

  clearUserInfo(): void {
    this.userInfoSubject.next(null);
    this.userIdSubject.next(null);
    this.userProfileSubject.next(null);
  }

  async loadUserProfile(userId: string): Promise<void> {
    try {
      // console.log(`🔍 Fetching profile for userId: ${userId}`);
      const profile = await firstValueFrom(this.apiService.getUserProfile(userId.toString()));

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

  getUserProfileSnapshot(): any | null {
    return this.userProfileSubject.value;
  }
}
