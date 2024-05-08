import { AfterViewInit, Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';

import { HttpClient } from '@angular/common/http';

import { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { MatFooterRow, MatRowDef, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import 'moment/locale/th.js';
// import moment from 'moment';
import { Subject, Subscription } from 'rxjs';

interface AssetDetails {
  assetId: any;
  purchaseDate: string;
  assetCode: string;
  assetName: string;
  purchasePrice: number;
  purchasedFrom: string;
  documentNumber: string;
  department: string;
  assetLocation: string;
  responsibleEmployee: string;
  Note: string;
  [key: string]: string | number; // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
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
    CardComponent, CardHeaderComponent, CardBodyComponent,
    RowComponent, ColComponent, TextColorDirective,
    CommonModule, ReactiveFormsModule, FormsModule,
    IconDirective, FormDirective, FormLabelDirective,
    FormControlDirective,
    MatPaginatorModule, MatTableModule, MatSort, MatPaginator, MatFooterRow, MatRowDef,
    ButtonDirective, NgStyle],
  templateUrl: './tablewiget2.component.html',
  styleUrl: './tablewiget2.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }]
})

export class Tablewiget2Component implements
  OnInit, OnDestroy, AfterViewInit {

  assetDetails: AssetDetails[] = [];
  assetDetails2: AssetDetails[] = [];

  displayedColumns2: string[] = [
    "การดำเนินการ",
    "วันเดือนปี",
    "รหัสครุภัณฑ์",
    "รายการ",
    "ราคาต่อหน่วย",
    "วิธีการได้มา",
    "เลขที่เอกสาร",
    "ฝ่าย",
    "ที่อยู่",
    "ผู้ใช้งาน",
    "หมายเหตุ"];
  displayedColumns3: string[] = ['location' , 'assetCount'];

  dataSource = new MatTableDataSource<AssetDetails>(this.assetDetails);
  dataSource2 = new MatTableDataSource<any>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] = [
    "purchaseDate",
    "assetCode",
    "assetName",
    "purchasePrice",
    "purchasedFrom",
    "documentNumber",
    "department",
    "assetLocation",
    "responsibleEmployee",
    "note"
  ];

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
    this.dataSubscription = this.http.get<AssetDetails[]>('https://localhost:7204/api/AssetDetails').subscribe(data => {
      // this.assetDetails = data.map(asset => {
      //   asset.purchaseDate = this.convertDate(asset.purchaseDate);
      //   asset = this.translateToThai(asset);
      //   return asset;
      // });
      this.assetDetails2 = data.map(asset => {
        return asset;
      });
      // this.dataSource.data = this.assetDetails2;// Update the data source with the new asset details
      // console.log(this.assetDetails2);
      this.countAssetsByLocation();
      
    });
  }

  countAssetsByLocation(): void {
    const assetCountByLocation: { [location: string]: number } = {}; // Create an object to store the count of assets in each location
    this.assetDetails2.forEach(asset => {
      const location = asset.assetLocation;
      // console.log(location);
      assetCountByLocation[location] = assetCountByLocation[location] ? assetCountByLocation[location] + 1 : 1;
    });

    console.log(assetCountByLocation);
    // สร้างข้อมูลสำหรับแสดงในตาราง
    const dataToShowInTable = Object.keys(assetCountByLocation).map(location => {
      return { location: location, assetCount: assetCountByLocation[location] };
    });

    // กำหนดข้อมูลให้กับ dataSource
    this.dataSource2.data = dataToShowInTable;

  }

  addasset(): void { window.location.href = "#/system/AssetDetails"; }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "purchaseDate": "วันเดือนปี",
      "assetCode": "รหัสครุภัณฑ์",
      "assetName": "รายการ",
      "purchasePrice": "ราคาต่อหน่วย",
      "purchasedFrom": "วิธีการได้มา",
      "documentNumber": "เลขที่เอกสาร",
      "assetLocation": "ที่อยู่",
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
