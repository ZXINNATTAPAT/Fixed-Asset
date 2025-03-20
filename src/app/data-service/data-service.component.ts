import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { AssetService } from './asset.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private assetDetailsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); // ✅ กำหนดค่าเริ่มต้นเป็นอาร์เรย์ว่าง

  constructor(public userService: UserService, public assetService: AssetService) {}
  

  // ✅ ให้ `userInfo$` และ `userId$` อ้างอิงจาก `UserService`
  get userInfo$() {
    return this.userService.userInfo$;
  }

  get userId$() {
    return this.userService.userId$;
  }

  getAssetDetails(): Observable<any[]> {
    return this.assetDetailsSubject.asObservable();
  }
  
}
