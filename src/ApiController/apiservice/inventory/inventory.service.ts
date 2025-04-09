// 📋 InventoryService - จัดการข้อมูลการตรวจนับครุภัณฑ์
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssetInventoryCycle {
  CycleId: number;
  CycleName: string;
  DateStart: string;
  DateEnd: string;
  Note?: string;
}

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
  private readonly baseUrl = 'https://dotnetapi-fixasset.onrender.com/api/';

  constructor(private http: HttpClient) {}

  // 🟩 Session Endpoints
  getSessions(endpoint: string): Observable<AssetInventorySession[]> {
    return this.http.get<AssetInventorySession[]>(`${this.baseUrl}${endpoint}`, { withCredentials: true });
  }

  // 🟩 Inventory Details
  getInventoryDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}AssetInventoryDetails`, { withCredentials: true });
  }

  getInventoryDetailById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}AssetInventoryDetails/${id}`, { withCredentials: true });
  }

  // 🟦 Cycles
  getCycles(): Observable<AssetInventoryCycle[]> {
    return this.http.get<AssetInventoryCycle[]>(`${this.baseUrl}AssetInventoryCycle`, { withCredentials: true });
  }

  addCycle(cycle: AssetInventoryCycle): Observable<AssetInventoryCycle> {
    return this.http.post<AssetInventoryCycle>(`${this.baseUrl}AssetInventoryCycle`, cycle , { withCredentials: true });
  }

  deleteCycle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}AssetInventoryCycle/${id}` , { withCredentials: true });
  }
}
