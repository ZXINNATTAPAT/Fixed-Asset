// 📦 AssetService - จัดการข้อมูลครุภัณฑ์
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';

export interface AssetInventoryDetails {
  inventoryDetailId: number;
  sessionId: number;
  assetId: number;
  assetName: string;
  systemQuantity: number;
  countedQuantity: number;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly baseUrl = 'https://localhost:7204/api/';

  constructor(private http: HttpClient) {}

  // ✅ ดึงรายการครุภัณฑ์ทั้งหมด
  getAssetInventory(): Observable<AssetInventoryDetails[]> {
    return this.http.get<AssetInventoryDetails[]>(`${this.baseUrl}AssetInventoryDetails`, { withCredentials: true });
  }

  // ✅ ดึงรายการครุภัณฑ์ตาม ID
  getAssetById(p0: string, id: number): Observable<AssetInventoryDetails> {
    return this.http.get<AssetInventoryDetails>(`${this.baseUrl}AssetInventoryDetails/${id}`, { withCredentials: true });
  }

  // ✅ สร้างรหัสครุภัณฑ์ใหม่
  generateAssetCode(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}AssetDetails/generate-code`, payload, { withCredentials: true });
  }

  // ✅ ดึงจำนวนสถานะของครุภัณฑ์
  getStatusCounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}AssetDetails/statuscount`, { withCredentials: true });
  }

  // ✅ ดึงข้อมูลทั่วไปจาก endpoint
  fetchData(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${endpoint}`, { withCredentials: true });
  }

  // ✅ ดึงข้อมูลจาก endpoint พร้อม query params
  fetchDataWithParams(endpoint: string, queryParams: any): Observable<any> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<any>(`${this.baseUrl}${endpoint}`, { params, withCredentials: true });
  }

  // ✅ ดึงข้อมูลจาก endpoint โดยใช้ ID
  fetchDataById(endpoint: string, id: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${endpoint}/${id}`, { withCredentials: true });
  }

  // ✅ POST ข้อมูลแบบ Promise
  async postData(endpoint: string, data: any): Promise<any> {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data, { withCredentials: true });
    return response.data;
  }

  // ✅ UPDATE ข้อมูลแบบ Promise
  async updateData(endpoint: string, data: any): Promise<any> {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data, { withCredentials: true });
    return response.data;
  }

  // ✅ UPDATE ข้อมูลตาม ID แบบ Promise
  async updateDataById(endpoint: string, id: number, data: any): Promise<any> {
    const response = await axios.put(`${this.baseUrl}${endpoint}/${id}`, data, { withCredentials: true });
    return response.data;
  }

  // ✅ DELETE ข้อมูลแบบ Promise
  async deleteData(endpoint: string): Promise<any> {
    const response = await axios.delete(`${this.baseUrl}${endpoint}`, { withCredentials: true });
    return response.data;
  }

  // ✅ ดึงรายการซ่อมแซมทั้งหมด
  getRepairAssets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}RepairAsset`, { withCredentials: true });
  }
}