import {AfterViewInit,Component,Injectable,OnDestroy,OnInit,ViewChild,} from '@angular/core';
import {MatFooterRow,MatRowDef,MatTableDataSource,MatTableModule,} from '@angular/material/table';
import {MatPaginator,MatPaginatorIntl,MatPaginatorModule,} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import 'moment/locale/th.js';
// import moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { DataService } from '../../../data-service/data-service.component';
import { ApiService } from '../../../ApiController/api-service.service';

export interface AssetDetails {
  AssetId: number;
  PurchaseDate: string;              // ISO date string
  AssetCode: string;
  AssetName: string;
  PurchasePrice: number;
  PurchasedFrom: string;
  DocumentNumber: string;
  Agency: string;
  Department: string;
  Faction: string;                   // เพิ่มให้ตรงกับที่คุณใช้ในกราฟ
  AssetLocation: string;
  ResponsibleEmployee: string;
  Status: string;
  Note: string;

  // Optional: หากคุณยังต้องการให้เข้าถึงผ่าน key string อื่นๆ ได้
  [key: string]: string | number | undefined;
}


@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = $localize`First page`;
  itemsPerPageLabel = $localize`Items per page:`;
  lastPageLabel = $localize`Last page`;

  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return $localize`Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return $localize`Page ${page + 1} of ${amountPages}`;
  }
}

@Component({
  selector: 'app-tablewiget2',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    NgStyle,
  ],
  templateUrl: './tablewiget2.component.html',
  styleUrl: './tablewiget2.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
})

export class Tablewiget2Component implements OnInit, OnDestroy, AfterViewInit {
  assetDetails2: AssetDetails[] = [];

  displayedColumns3: string[] = ['Faction', 'ResponsibleEmployee', 'AssetCount'];

  dataSource = new MatTableDataSource<any>();

  private dataSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient,private ap: ApiService, private dataService: DataService) {}

  ngOnInit(): void {
    this.getAssetDetails();
    console.log('📊 dataSource:', this.dataSource.data);

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  getAssetDetails(): void {
    const existingData = this.dataService.getAssetDetails();
  
    this.dataSubscription = existingData?.subscribe((data) => {
      if (data && data.length > 0) {
        console.log('📥 Loaded from dataService (cache):', data);
        this.assetDetails2 = data;
        this.countAssetsByFactionAndUser();
      } else {
        console.log('📡 Fallback to API because dataService is empty');
        this.ap.fetchDatahttp('AssetDetails/GetForTable')
          .subscribe((apiData) => {
            console.log('📥 Loaded from API:', apiData);
            this.assetDetails2 = apiData;
            this.countAssetsByFactionAndUser();
          });
      }
    });
  }
  

  countAssetsByFactionAndUser(): void {
    const assetCountMap: { [key: string]: number } = {};
  
    this.assetDetails2.forEach((asset) => {
      const faction = asset.Faction || 'ไม่ระบุฝ่าย';
      const user = asset.ResponsibleEmployee || 'ไม่ระบุผู้ใช้งาน';
      const key = `${faction}|||${user}`;
      assetCountMap[key] = (assetCountMap[key] || 0) + 1;
    });
  
    const dataToShow = Object.keys(assetCountMap).map((key) => {
      const [faction, user] = key.split('|||');
      return {
        faction,
        responsibleEmployee: user,
        assetCount: assetCountMap[key],
      };
    });
  
    dataToShow.sort((a, b) => b.assetCount - a.assetCount);
  
    this.dataSource.data = dataToShow;
  }  

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(price: number): string {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  addasset(): void {
    window.location.href = '#/system/AssetDetails';
  }
}
