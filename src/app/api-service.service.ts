import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = 'https://localhost:7204/api/';

  constructor(private http: HttpClient) {}

  // Example method to fetch data from the API
  async fetchData(endpoint: string): Promise<any> {
    const response = await axios.get(`${this.apiUrl}${endpoint}`);
    return response.data;
  }

  fetchDatahttp(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${endpoint}`);
  }

  fetchDatahttp25(endpoint: string, queryParams: any): Observable<any> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<any>(`${this.apiUrl}${endpoint}`, { params });
  }
  
  
  // Example method to post data to the API
  async postData(endpoint: string, data: any): Promise<any> {
    const response = await axios.post(`${this.apiUrl}${endpoint}`, data);
    return response.data;
  }

  // Example method to update data on the API
  async updateData(endpoint: string, data: any): Promise<any> {
    const response = await axios.put(`${this.apiUrl}${endpoint}`, data);
    return response.data;
  }

  // Example method to delete data from the API
  async deleteData(endpoint: string): Promise<any> {
    const response = await axios.delete(`${this.apiUrl}${endpoint}`);
    return response.data;
  }
}

