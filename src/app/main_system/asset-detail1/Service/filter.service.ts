import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {

  private filteredDepartments$ = new BehaviorSubject<any[]>([]);
  private filteredFactions$ = new BehaviorSubject<any[]>([]);
  private filteredAssetCategories$ = new BehaviorSubject<any[]>([]);

  filterAssetCategories(assetCategories: any[], searchValue: string | null): Observable<any[]> {
    const filteredAssetCategories = assetCategories.filter((category) =>
      searchValue && typeof category.CategoryName === 'string' 
        ? category.CategoryName.toLowerCase().includes(searchValue.toLowerCase()) 
        : true
    );
  
    this.filteredAssetCategories$.next(filteredAssetCategories);
    return this.filteredAssetCategories$.asObservable();
  }
  

  filterFactions(factions: any[], searchValue: string | null): Observable<any[]> {
    const filteredFactions = factions.filter((faction) =>
      searchValue ? faction.Name.toLowerCase().includes(searchValue.toLowerCase()) : true
    );
    this.filteredFactions$.next(filteredFactions);
    return this.filteredFactions$.asObservable();
  }

  filterDepartments(departments: any[], searchValue: string | null): Observable<any[]> {
    const filteredDepartments = departments.filter((department) =>
      searchValue ? department.Name.toLowerCase().includes(searchValue.toLowerCase()) : true
    );
    this.filteredDepartments$.next(filteredDepartments);
    return this.filteredDepartments$.asObservable();
  }

}
