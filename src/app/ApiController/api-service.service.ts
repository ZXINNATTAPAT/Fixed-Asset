import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import axios from 'axios';

export interface AssetInventorySession {
  SessionId: number;
  Date: string;
  SessionName: string;
  DepartmentId?: number;
  FactionId?: number;
  VerifierId?: number;
  Note?: string;
}

@Injectable({providedIn: 'root'})
export class ApiService {
  private baseUrl = 'https://localhost:7204/api/Users'; // URL หลักของ API

  private apiUrl     = 'https://localhost:7204/api/';

  private apiUrlauth = 'https://localhost:7204/auth/';

  private profileUrl = 'https://localhost:7204/auth/profile'; // URL ของ Endpoint

  public apiUrl_link = 'http://localhost:4200/#/';

  private apiUnit = 'https://gdcatalog.go.th/api/3/action/datastore_search';

  constructor(private http: HttpClient) {}

  // Login
  login(credentials: { username: string; password: string }) {
    return this.http.post(`${this.apiUrlauth}login`, credentials, { withCredentials: true });
  }

  // Logout
  logout() {
    return this.http.post(`${this.apiUrlauth}logout`, {}, { withCredentials: true });
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/${userId}`, 
      { withCredentials: true });
  }

  getUserRole(): Observable<{ username: string, roles: string[] }> {
    return this.http.get<{ username: string, roles: string[] }>
    (`${this.apiUrlauth}userrole`, 
      { withCredentials: true });
  }
  

  getUserInfos(): Observable<any> {
    return this.http.get<any>(
      this.profileUrl, 
      { withCredentials: true });
  } 

  // ตรวจสอบสถานะการล็อกอิน
  isLoggedIn(): Observable<boolean> {
    return this.http.get(
      `${this.apiUrlauth}isLoggedIn`, { withCredentials: true })
      .pipe(map(() => true), // หาก API ตอบกลับ 200 แปลว่าล็อกอิน
      catchError(async () => (false)) // หากเกิดข้อผิดพลาด แปลว่ายังไม่ได้ล็อกอิน
    );
  }

  // Example method to fetch data from the API
  async fetchData(endpoint: string): Promise<any> {
    const response = await axios.get(`${this.apiUrl}${endpoint}`);
    return response.data;
  }

  fetchDatahttp(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${endpoint}`);
  }

  fetchDatahttpbyId(endpoint: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${endpoint}/${id}`,{ withCredentials: true });
  }
  
  fetchDatahttp25(endpoint: string, queryParams: any): Observable<any> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<any>(`${this.apiUrl}${endpoint}`, { params });
  }

   /**
   * ดึงข้อมูลจาก API
   * @param resourceId Resource ID ที่ใช้สำหรับดึงข้อมูล
   * @param limit จำนวนข้อมูลที่ต้องการ (ค่าเริ่มต้น: 500)
   * @returns Observable ที่มีข้อมูลที่ดึงจาก API
   */
   getData(resourceId: string, limit: number = 500): Observable<any> {
    const params = {
      resource_id: resourceId,
      limit: limit.toString(),
    };

    return this.http.get(this.apiUnit, { params });
  }

   /**
   * สร้าง Asset Code
   * @param payload ข้อมูลที่ส่งไปยัง API
   * @returns Observable ที่ส่งคืนข้อมูล assetCode
   */
   generateAssetCode(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AssetDetails/generate-code`, payload, { withCredentials: true });
  }
  
  // Example method to post data to the API
  async postData(endpoint: string, data: any): Promise<any> {
    const response = await axios
    .post(`${this.apiUrl}${endpoint}`,data ,{ withCredentials: true } );
    return response.data;
  }

  // Example method to update data on the API
  async updateData(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.put(`${this.apiUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error('Error occurred while updating data:', error);
  
      // ขว้างข้อผิดพลาด (throw) เพื่อให้ฟังก์ชันที่เรียกใช้สามารถจัดการได้
      // throw error.response ? error.response.data : error.message;
    }
  }
  
  // Example method to delete data from the API
  async deleteData(endpoint: string): Promise<any> {
    const response = await axios.delete(`${this.apiUrl}${endpoint}`);
    return response.data;
  }

  getStatusCounts(): Observable<any> {
    return this.http.get<any>('https://localhost:7204/api/AssetDetails/statuscount');
  }

  getSessions(endpoint:string): Observable<AssetInventorySession[]> {
    return this.http.get<AssetInventorySession[]>(`${this.apiUrl}${endpoint}`);
  }

  
  
}

