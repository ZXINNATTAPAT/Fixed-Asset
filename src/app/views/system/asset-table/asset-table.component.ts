import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';

import { HttpClient } from '@angular/common/http';

import { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';


import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import 'moment/locale/th.js';
import moment from 'moment';
import { Subscription } from 'rxjs';

interface AssetDetails {
  assetId: any;
  purchaseDate: string;
  assetCode: string;
  assetName: string;
  purchasePrice: number;
  purchasedFrom: string;
  documentNumber: string;
  department: string;
  responsibleEmployee: string;
  Note: string;
}

@Component({
  selector: 'app-asset-table',
  providers: [DatePipe],
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent,
    RowComponent, ColComponent, TextColorDirective,
    CommonModule, ReactiveFormsModule, FormsModule,
    IconDirective, FormDirective, FormLabelDirective,
    FormControlDirective, MatPaginatorModule, MatTableModule,
    ButtonDirective, NgStyle],
  templateUrl: './asset-table.component.html',
  styleUrl: './asset-table.component.scss'
})

export class AssetTableComponent implements OnInit, AfterViewInit, OnDestroy {
  
  displayedColumns2: string[] = ["การดำเนินการ","วันเดือนปี","รหัสครุภัณฑ์","รายการ","ราคาต่อหน่วย","วิธีการได้มา","เลขที่เอกสาร","ฝ่าย","ผู้ใช้งาน","หมายเหตุ"];

  displayedColumns: string[] = [
    "purchaseDate",
    "assetCode",
    "assetName",
    "purchasePrice",
    "purchasedFrom",
    "documentNumber",
    "department",
    "responsibleEmployee",
    "note"
  ];

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  assetDetails: AssetDetails[] = [];
  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);
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
  
  ngAfterViewInit(): void {
      throw new Error('Method not implemented.');
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  getAssetDetails(): void {
    this.dataSubscription = this.http.get<any[]>('https://localhost:7204/api/AssetDetails').subscribe(data => {
      this.assetDetails = data.map(asset => {
        asset.purchaseDate = this.convertDate(asset.purchaseDate);
        asset = this.translateToThai(asset);
        return asset;
      });
      // Update the data source with the new asset details
      this.dataSource.data = this.assetDetails;
    });
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

  // convertDate(dateString: string): string {
  //   const formattedDate = moment(dateString).locale('th').format('ll');
  //   return formattedDate ?? '';
  // }
  
  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource!.filter = filterValue.trim().toLowerCase();

    if (this.dataSource?.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editAsset(asset: any): void {
    window.location.href = `#/system/Editasset/${asset.assetId}`;
  }

  deleteAsset(asset: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    }).then((result) => {

      if (result.isConfirmed) {
        // ผู้ใช้ยืนยันแล้ว ดำเนินการลบ
        this.http.delete(`https://localhost:7204/api/AssetDetails/${asset.assetId}`).subscribe(
          () => {
            const index = this.assetDetails.findIndex(a => a.assetId === asset.assetId);
              if (index !== -1) {
                this.assetDetails.splice(index, 1);
                // Update the data source after deletion
                this.dataSource.data = this.assetDetails;
              }
            Swal.fire(
              'ลบแล้ว!',
              'สินทรัพย์ของคุณถูกลบแล้ว',
              'success'
            );
          },
          (error) => {
            console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
            Swal.fire(
              'ข้อผิดพลาด!',
              'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์',
              'error'
            );
          }
        );
        
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // ผู้ใช้ยกเลิก ไม่ต้องกระทำอะไร
        Swal.fire(
          'ยกเลิกแล้ว',
          'สินทรัพย์ของคุณปลอดภัย :)',
          'info'
        );
      }
    });
  }

  formatCurrency(price: number): string {

    return price.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  }

  exportExcel(): void {

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Assets');

    // Add headers
    const headers = ['วันเดือนปี', 'รหัสครุภัณฑ์', 'รายการ', 'ราคาต่อหน่วย', 'วิธีการได้มา', 'เลขที่เอกสาร', 'ฝ่าย', 'ผู้ใช้งาน', 'หมายเหตุ'];
    worksheet.addRow(headers);

    // Add data
    this.assetDetails.forEach((asset: any) => { // ใช้ any หรือ interface ที่ไม่ได้ระบุก็ได้
      const row = [];
      row.push(asset.วันเดือนปี);
      row.push(asset.รหัสครุภัณฑ์);
      row.push(asset.รายการ);
      row.push(this.formatCurrency(asset.ราคาต่อหน่วย));
      row.push(asset.วิธีการได้มา);
      row.push(asset.เลขที่เอกสาร);
      row.push(asset.ฝ่าย);
      row.push(asset.ผู้ใช้งาน);
      row.push(asset.หมายเหตุ);
      worksheet.addRow(row);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assets.xlsx';
      a.click();
    });
  }

 

}


//   async searchAsset(): Promise<void> {
  //     const assetCode = this.assetCodeInput;

  //     // ใช้เงื่อนไขการเปรียบเทียบค่าที่ต้องการ (เช่น >=, <=, === เป็นต้น) กับค่าที่มีอยู่ในรายการ
  //     const foundAsset = this.assetDetailsset.find(asset => {
  //         // เช็คว่ารหัสครุภัณฑ์ในรายการเป็นค่าที่คล้ายค่าที่ผู้ใช้ป้อนเข้ามาหรือไม่
  //         return asset.รหัสครุภัณฑ์.startsWith(assetCode) || asset.รหัสครุภัณฑ์.startsWith(assetCode + "-");
  //     });

  //     if (foundAsset) {
  //         // พบรหัสครุภัณฑ์ในรายการ
  //         console.log('Found asset:', foundAsset);
  //         this.dataSource = new MatTableDataSource<any>([foundAsset]); // แปลงเป็นอาร์เรย์เดี่ยวแล้วสร้าง MatTableDataSource

  //         // ทำอย่างไรก็ได้ตามที่ต้องการกับข้อมูลที่พบ
  //     } else {
  //         // ไม่พบรหัสครุภัณฑ์ในรายการ
  //         console.log('Asset with code', assetCode, 'not found.');
  //         // จัดการกรณีที่ไม่พบรหัสครุภัณฑ์ที่ต้องการ
  //     }
  // }