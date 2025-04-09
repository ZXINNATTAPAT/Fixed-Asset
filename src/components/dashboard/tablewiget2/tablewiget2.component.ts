import {AfterViewInit,Component,Injectable,OnDestroy,OnInit,ViewChild,} from '@angular/core';
import {MatFooterRow,MatRowDef,MatTableDataSource,MatTableModule,} from '@angular/material/table';
import {MatPaginator,MatPaginatorIntl,MatPaginatorModule,} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import 'moment/locale/th.js';
// import moment from 'moment';
import { filter, map, of, Subject, Subscription, switchMap } from 'rxjs';
import { DataService } from '../../../data-service/data-service.component';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';

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

interface Claims {
  DeptId: string;
  Faction: string;
  FactionId: string;
  Role: string;
  Affiliation: string;
  Department: string;
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
    MatSort,
    NgStyle,
  ],
  templateUrl: './tablewiget2.component.html',
  styleUrl: './tablewiget2.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
})

export class Tablewiget2Component implements OnInit, OnDestroy, AfterViewInit {
  assetDetails2: AssetDetails[] = [];

  displayedColumns3: string[] = ['faction', 'responsibleEmployee', 'assetCount'];

  dataSource = new MatTableDataSource<any>();

  userinfo: any = [];

  private dataSubscription!: Subscription;
  private userInfoSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private ap: ApiService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.initializeUserInfo();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.userInfoSubscription) {
      this.userInfoSubscription.unsubscribe();
    }
  }

  initializeUserInfo(): void {
    this.userInfoSubscription = this.dataService.userInfo$
      .pipe(filter((userInfo: any) => !!userInfo?.claims?.DeptId))
      .subscribe((userInfo: any) => {
        this.userinfo = userInfo.claims;
        console.log("✅ UserInfo Loaded:", this.userinfo);
        this.getAssetDetails(this.userinfo.DeptId);
      });
  }

  getAssetDetails(deptId: string): void {
    const existingData = this.dataService.getAssetDetails();

    this.dataSubscription = existingData?.subscribe((data) => {
      if (data && data.length > 0) {
        const filtered = data.filter(asset => asset.DeptId == deptId);
        console.log('📥 Loaded from cache (filtered):', filtered);
        this.assetDetails2 = filtered;
        this.countAssetsByFactionAndUser();
      } else {
        this.ap.assetService.fetchData(`AssetDetails/GetForTable?deptId=${deptId}`)
          .subscribe((apiData) => {
            console.log('🌐 Loaded from API (filtered):', apiData);
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

    // ให้ Angular จัดการ render paginator ก่อน
    setTimeout(() => {
      this.dataSource.data = dataToShow;
    });
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


