import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private assetDetailsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private assetTypesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private assetCategorySubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private numberOfAssets!: number;

  public assetDetails$: Observable<any[]> = this.assetDetailsSubject.asObservable();
  public assetTypes$: Observable<any[]> = this.assetTypesSubject.asObservable();
  public assetCategory$: Observable<any[]> = this.assetCategorySubject.asObservable();

  constructor() {}

  setNumberOfAssets(value: number): void {
    this.numberOfAssets = value;
  }

  getNumberOfAssets(): number {
    return this.numberOfAssets;
  }

  setAssetDetails(value: any[]): void {
    this.assetDetailsSubject.next(value);
  }

  getAssetDetails(): Observable<any[]> {
    return this.assetDetails$;
  }

  setAssetTypes(value: any[]): void {
    this.assetTypesSubject.next(value);
  }

  getAssetTypes(): Observable<any[]> {
    return this.assetTypes$;
  }

  setAssetCategory(value: any[]): void {
    this.assetCategorySubject.next(value);
  }

  getAssetCategory(): Observable<any[]> {
    return this.assetCategory$;
  }
}
