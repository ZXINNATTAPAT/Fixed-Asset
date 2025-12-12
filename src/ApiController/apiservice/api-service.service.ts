// 🧩 ApiService - Facade รวมทุก Service เข้าด้วยกันในจุดเดียว
import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { AssetService } from './asset/asset.service';
import { InventoryService } from './inventory/inventory.service';
import { UserService } from './users/user.service';
import { ExternalDataService } from './external-data/external-data.service';
import { RoleService } from './users/role.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
    public assetService: AssetService,
    public inventoryService: InventoryService,
    public userService: UserService,
    public externalDataService: ExternalDataService,
    public role : RoleService
  ) {}

  // public apiUrl_link = 'https://localhost:7204/api/'; // URL ของ API
  public apiUrl_link = 'http://localhost:5194/api/'; // URL ของ API

  
}

/**
 * ✅ วิธีใช้ใน Component หรือ Service อื่น:
 * constructor(private api: ApiService) {}
 * 
 * ตัวอย่าง:
 * this.api.authService.login(...)
 * this.api.assetService.getAssetInventory()
 * this.api.fetchData('AssetDetails')
 */