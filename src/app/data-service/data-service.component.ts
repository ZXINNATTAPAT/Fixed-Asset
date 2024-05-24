import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private numberOfAssets!: number;
  // private assetDetails!: any[];
  // private assetTypes!: any[];
  // private assetCategory!: any[];
  private assetDetailsSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  public assetDetails$: Observable<any[]> =
    this.assetDetailsSubject.asObservable();

  private assetTypesSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  public assetTypes$: Observable<any[]> = this.assetTypesSubject.asObservable();

  private assetCategorySubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  public assetCategory$: Observable<any[]> =
    this.assetCategorySubject.asObservable();

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
