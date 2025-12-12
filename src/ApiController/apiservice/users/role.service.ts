import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {

    private readonly baseUrl = 'http://localhost:5194/api/';
    private roleClassMap: Map<string, string> = new Map([
        ['Admin', 'btn-outline-danger'],
        ['เจ้าหน้าที่พัสดุ', 'btn-outline-primary'],
        ['ผู้อำนวยการ', 'btn-outline-warning'],
    ]);

  constructor(private http: HttpClient) {}

  loadRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}roles` , { withCredentials: true });
  }

  getRoleClass(roleName: string): string {
    return this.roleClassMap.get(roleName) || 'btn-outline-secondary';
  }
}
