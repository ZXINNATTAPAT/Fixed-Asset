// 📋 InventoryService - จัดการข้อมูลการตรวจนับครุภัณฑ์
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssetInventorySession {
  SessionId: number;
  Date: string;
  SessionName: string;
  DepartmentId: number;
  VerifierId: number;
  Inspectors?: {
    InspectorName: any;
    Id: number;
    SessionId: number;
    InspectorId: number;
  }[];
  InspectorsList?: string;
  VerifierName?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly baseUrl = 'https://localhost:7204/api/';

  constructor(private http: HttpClient) {}

  // ✅ ดึงรายการ Session การตรวจนับ
  getSessions(endpoint: string): Observable<AssetInventorySession[]> {
    return this.http.get<AssetInventorySession[]>(`${this.baseUrl}${endpoint}`, { withCredentials: true });
  }

  // ✅ ดึงข้อมูลตรวจนับครุภัณฑ์ทั้งหมด
  getInventoryDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}AssetInventoryDetails`, { withCredentials: true });
  }

  // ✅ ดึงข้อมูลตรวจนับครุภัณฑ์ตาม ID
  getInventoryDetailById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}AssetInventoryDetails/${id}`, { withCredentials: true });
  }
}
