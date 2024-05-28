import {
  AfterViewInit,
  Component,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiService } from 'src/app/api-service.service';
import { CommonModule, NgStyle } from '@angular/common';
import {
  cilPencil,
  cilTrash,
  cibAddthis,
  cilDataTransferDown,
  cilInfo,
} from '@coreui/icons';
import {
  MatFooterRow,
  MatRowDef,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import 'moment/locale/th.js';
// import moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { DataService } from 'src/app/data-service/data-service.component';

// interface AssetDetails {
//   assetId: any;
//   purchaseDate: string;
//   assetCode: string;
//   assetName: string;
//   purchasePrice: number;
//   purchasedFrom: string;
//   documentNumber: string;
//   department: string;
//   responsibleEmployee: string;
//   Note: string;
//   [key: string]: string | number; // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
// }

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
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
  templateUrl: './tablewiget3.component.html',
  styleUrl: './tablewiget3.component.scss',
})

export class Tablewiget3Component implements OnInit, OnDestroy, AfterViewInit {

  displayedColumns: string[] = ['category', 'assetType', 'assetCount'];

  totalAssetsByCategory: { [category: string]: number } = {};

  totalAssetsByType: { [type: string]: number } = {};

  assetDetails: any[] = [];

  assetTypes:any[]=[];
  
  assetCategories:any[]=[];

  dataSource = new MatTableDataSource<any>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  private dataSubscription!: Subscription;

  ngOnInit(): void {
    // this.getAssetDetails();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  constructor( private ap :ApiService ,private dataService :DataService) {
    this.getAssetDetails();
    this.getAssetType();
  }

  @ViewChild(MatSort) sort!: MatSort;

  getAssetDetails(): void {

    if(this.dataService){
      this.dataService.getAssetDetails()
        .subscribe((data) => {
          this.assetDetails = data; // เก็บข้อมูลสินทรัพย์ไว้ในตัวแปร assetDetails
          this.countAssetsByCategory(); // เรียกใช้งานเมื่อข้อมูลถูกโหลดเสร็จ
        });
    }
    else{
      this.ap.fetchData('assetDetails')
      .catch((data) => {
        this.assetDetails = data; // เก็บข้อมูลสินทรัพย์ไว้ในตัวแปร assetDetails
        this.countAssetsByCategory(); // เรียกใช้งานเมื่อข้อมูลถูกโหลดเสร็จ
      });
    }
    
  }

  getAssetType(): void {
    if (this.dataService.getAssetTypes() && this.dataService.getAssetCategory()) {
      this.dataService.getAssetTypes().subscribe(assetTypes => {
        this.assetTypes = assetTypes;
      });
      
      this.dataService.getAssetCategory().subscribe(assetCategories => {
        this.assetCategories = assetCategories;
      });
    }
    else{
      this.ap.fetchData('Assettypecodes').catch((data) => {
        this.assetTypes = data;
        // console.log(this.assetTypes);
      });
    
      this.ap.fetchData('Assetcategories').catch((data) => {
        this.assetCategories = data;
        // console.log(this.assetCategories);
      });
    }
  }
  
  countAssetsByCategory(): void {
    const assetCountByCategory: { [category: string]: number } = {};
    
    console.log(assetCountByCategory);
  
    this.assetDetails.forEach((asset) => {
      let categoryCode = asset.assetCategory || 'Unknown'; // Set a default value if asset category is null
      const assetTypeCode = asset.assetType;
  
      // Create a combined key with asset type and category
      const combinedKey = `${assetTypeCode}-${categoryCode}`;
      assetCountByCategory[combinedKey] = (assetCountByCategory[combinedKey] || 0) + 1;
    });
  
    // Prepare data to show in the table
    const dataToShowInTable = Object.entries(assetCountByCategory).map(([combinedKey, count]) => {
      const [assetTypeCode, categoryCode] = combinedKey.split('-');
      
      // Find asset type name
      const assetType = this.assetTypes.find(type => type.assetCode === assetTypeCode);
      const assetTypeName = assetType ? assetType.assetName : 'Unknown';
  
      // Find asset category name
      const assetCategory = this.assetCategories.find(category => category.asc_Code === categoryCode);
      const assetCategoryName = assetCategory ? assetCategory.asc_Name : 'Unknown';
  
      // Check if asset category code is null or undefined and assign a default value if so
      const formattedCategoryCode = categoryCode || 'Unknown';
      console.log(formattedCategoryCode);
  
      return {
          category: assetCategoryName,
          assetType: assetTypeName,
          assetCount: count,
      };
  });
  console.log(dataToShowInTable);
  this.dataSource.data = dataToShowInTable;
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      purchaseDate: 'วันเดือนปี',
      assetCode: 'รหัสครุภัณฑ์',
      assetName: 'รายการ',
      purchasePrice: 'ราคาต่อหน่วย',
      purchasedFrom: 'วิธีการได้มา',
      documentNumber: 'เลขที่เอกสาร',
      department: 'ฝ่าย',
      responsibleEmployee: 'ผู้ใช้งาน',
      note: 'หมายเหตุ',
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }

  formatCurrency(price: number): string {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
}
