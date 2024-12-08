import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  private cache = new Map<string, { response: HttpResponse<any>, timestamp: number }>();

  private cacheableUrls = [
    'https://localhost:7204/auth/profile',
    'https://localhost:7204/api/Assettype',
    // 'https://localhost:7204/api/Assetcategories',
    'https://localhost:7204/api/Countingunits',
    'https://localhost:7204/api/Factiontypecodes',
    
    'https://img.icons8.com/?size=100&id=24717&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=75QfRZgar9GS&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=10758&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=6ozUksPEPg6G&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=9917&format=png&color=000000',
    'https://img.icons8.com/?size=100&id=1387&format=png&color=000000'

  ]; // ระบุ API ที่ต้องการ Cache

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // ตรวจสอบว่า URL นี้อยู่ในรายการที่ Cache ได้หรือไม่
    if (!this.cacheableUrls.some(url => req.urlWithParams.startsWith(url))) {
      return next.handle(req); // ข้าม Cache หาก URL ไม่ตรง
    }

    // Cache เฉพาะ GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cached = this.cache.get(req.urlWithParams);
    if (cached) {
      const isExpired = (Date.now() - cached.timestamp) > 15 * 60 * 1000; // Expire after 15 minutes
      if (!isExpired) {
        console.log(`Cache hit for ${req.urlWithParams}`);
        return of(cached.response.clone());
      } else {
        console.log(`Cache expired for ${req.urlWithParams}`);
        this.cache.delete(req.urlWithParams); // Remove expired cache
      }
    }

    console.log(`Cache miss for ${req.urlWithParams}`);
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.urlWithParams, { response: event, timestamp: Date.now() });
        }
      })
    );
  }

  // Method to clear specific cache entry
  clearCache(url: string): void {
    console.log(`Cache cleared for ${url}`);
    this.cache.delete(url);
  }

  // Method to clear all cache entries
  clearAllCache(): void {
    console.log(`All cache cleared`);
    this.cache.clear();
  }
}
