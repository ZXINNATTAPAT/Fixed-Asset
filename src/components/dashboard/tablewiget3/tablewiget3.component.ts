import { AfterViewInit,Component,Injectable,OnDestroy,OnInit,ViewChild,} from '@angular/core';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { NgIf, NgStyle } from '@angular/common';
import { MatFooterRow,MatRowDef,MatTableDataSource,MatTableModule,} from '@angular/material/table';
import { MatPaginator,MatPaginatorIntl,MatPaginatorModule,} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import 'moment/locale/th.js';
import { Subject, Subscription } from 'rxjs';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective  } from 'ng2-charts';
import { Router } from '@angular/router';

interface AssetDetails {
  assetId: number;
  assetCode: string;
  assetName: string;
  assetType: string;
  assetCategory: string;
  purchasedFrom: string;
  [key: string]: string | number;
}

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = $localize`First page`;
  itemsPerPageLabel = $localize`Items per page:`;
  lastPageLabel = $localize`Last page`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
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
  selector: 'app-tablewiget3',
  standalone: true,
  imports: [
    MatSortModule,
    MatPaginatorModule,
    MatTableModule,
    MatSort,
    MatPaginator,
    MatFooterRow,
    MatRowDef,
    NgStyle,
    BaseChartDirective,
    NgIf,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
  templateUrl: './tablewiget3.component.html',
  styleUrl: './tablewiget3.component.scss',
})

export class Tablewiget3Component implements OnInit, OnDestroy, AfterViewInit {
  
  displayedColumns: string[] = ['AssetType', 'CategoryName', 'AssetCount'];
  dataSource = new MatTableDataSource<any>([]);
  
  assets: any[] = [];
  assetTypes: string[] = [];
  selectedCategory: string | null = null; // ✅ เพิ่มตัวแปรนี้
  selectedType: string | null = null;

  public pieChartLabels: string[] = [];
  public pieChartData: ChartDataset[] = [{ data: [] }];
  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartOptions = { responsive: true };

  private dataSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private apiService: ApiService, private router :Router) {}

  ngOnInit(): void {
    this.loadAssetData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  // ✅ โหลดข้อมูลจาก API
  loadAssetData(): void {
    this.dataSubscription = this.apiService.assetService.fetchData('AssetDetails/AssetCountsByCategory').subscribe({
      next: (data) => {
        this.assets = data;
        this.dataSource.data = this.assets;
        this.updateMainChart();
      },
      error: (error) => {
        console.error('❌ Error loading asset data:', error);
      }
    });
  }

  // ✅ อัปเดต Pie Chart ให้แสดง AssetType เป็นหลัก
  updateMainChart(): void {
    this.selectedCategory = null; // ✅ รีเซ็ตเมื่อกลับไปมุมมองหลัก
    this.selectedType = null;
    this.assetTypes = [...new Set(this.assets.map(item => item.AssetType))];

    this.pieChartLabels = this.assetTypes;
    this.pieChartData = [
      { 
        data: this.assetTypes.map(type => 
          this.assets
            .filter(item => item.AssetType === type)
            .reduce((sum, item) => sum + item.AssetCount, 0)
        ) 
      }
    ];
  }

  // ✅ แสดงหมวดหมู่ย่อยเมื่อกด
  onChartClick(event: any): void {
    if (event.active && event.active.length > 0) {
      const index = event.active[0].index;
      this.showDetails(this.pieChartLabels[index]);
    }
  }

  // ✅ แสดงหมวดหมู่ย่อยของประเภทครุภัณฑ์
  showDetails(assetType: string): void {
    this.selectedType = assetType;
    const filteredAssets = this.assets.filter(item => item.AssetType === assetType);

    this.selectedCategory = assetType; // ✅ ตั้งค่า `selectedCategory`
    this.pieChartLabels = filteredAssets.map(item => item.CategoryName);
    this.pieChartData = [{ data: filteredAssets.map(item => item.AssetCount) }];
  }

  // ✅ กลับไปดู AssetType หลัก
  goBack(): void {
    this.updateMainChart();
  }

  goToAssetDetails(): void {
    this.router.navigate(['/system/main/assetDetails']);
  }
}

