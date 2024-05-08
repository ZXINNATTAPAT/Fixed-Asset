import { AfterViewInit, Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent ,RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { MatFooterRow, MatRowDef, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import 'moment/locale/th.js';
// import moment from 'moment';
import { Subject, Subscription } from 'rxjs';

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
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent,
    RowComponent, ColComponent, TextColorDirective,
    CommonModule, ReactiveFormsModule, FormsModule,
    IconDirective, FormDirective, FormLabelDirective,
    FormControlDirective,
    MatPaginatorModule, MatTableModule, MatSort, MatPaginator, MatFooterRow, MatRowDef,
    ButtonDirective, NgStyle],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
  templateUrl: './tablewiget3.component.html',
  styleUrl: './tablewiget3.component.scss'
})

export class Tablewiget3Component implements OnInit, OnDestroy, AfterViewInit {

  displayedColumns: string[] = ['category','assetType', 'assetCount'];
  
  totalAssetsByCategory: { [category: string]: number } = {};
  totalAssetsByType: { [type: string]: number } = {};

  assetDetails: any[] = [];

  dataSource = new MatTableDataSource<any>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  private dataSubscription!: Subscription;

  ngOnInit(): void {
    this.getAssetDetails();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  constructor(private http: HttpClient) {
    this.getAssetDetails();
  }

  @ViewChild(MatSort) sort!: MatSort;

  getAssetDetails(): void {
    this.http.get<AssetDetails[]>('https://localhost:7204/api/AssetDetails').subscribe(data => {
      this.assetDetails = data; // เก็บข้อมูลสินทรัพย์ไว้ในตัวแปร assetDetails
      this.countAssetsByCategory(); // เรียกใช้งานเมื่อข้อมูลถูกโหลดเสร็จ
    });
  }
  
  countAssetsByCategory(): void {
    let assetType:any = '';
    const assetCountByCategory: { [category: string]: number } = {}; 
    this.assetDetails.forEach(asset => {
      const category = asset.assetCategory; 
      assetType =  asset.assetType;
      assetCountByCategory[category] = assetCountByCategory[category] ? assetCountByCategory[category] + 1 : 1;
    });
  
    // console.log(assetCountByCategory);
  
    const dataToShowInTable = Object.keys(assetCountByCategory).map(category => {
      return { category: category, assetType:assetType,  assetCount: assetCountByCategory[category] };
    });
  
    this.dataSource.data = dataToShowInTable;
    // กำหนดข้อมูลให้กับ dataSource
    // console.log(this.dataSource.data);
  }
  
  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "purchaseDate": "วันเดือนปี",
      "assetCode": "รหัสครุภัณฑ์",
      "assetName": "รายการ",
      "purchasePrice": "ราคาต่อหน่วย",
      "purchasedFrom": "วิธีการได้มา",
      "documentNumber": "เลขที่เอกสาร",
      "department": "ฝ่าย",
      "responsibleEmployee": "ผู้ใช้งาน",
      "note": "หมายเหตุ"
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
    return price.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
}
