// 🌐 ExternalDataService - ดึงข้อมูลจากแหล่งภายนอก เช่น GDCatalog
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExternalDataService {
  private readonly gdCatalogUrl = 'https://gdcatalog.go.th/api/3/action/datastore_search';

  constructor(private http: HttpClient) {}

  /**
   * ✅ ดึงข้อมูลจาก GDCatalog API
   * @param resourceId รหัส resource ของข้อมูล
   * @param limit จำนวนข้อมูลที่ต้องการ (default = 500)
   */
  getData(resourceId: string, limit: number = 500): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        resource_id: resourceId,
        limit: limit.toString(),
      }
    });
    return this.http.get(this.gdCatalogUrl, { params });
  }
}