import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7204/api/';

  constructor(private http: HttpClient) { }

  // Example method to fetch data from the API
  fetchData(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${endpoint}`);
  }

  // Example method to post data to the API
  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${endpoint}`, data);
  }

  // Example method to update data on the API
  updateData(endpoint: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${endpoint}`, data);
  }

  // Example method to delete data from the API
  deleteData(endpoint: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${endpoint}`);
  }
}

