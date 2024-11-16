import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
} from '@coreui/angular';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
  RowComponent,
  ColComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';

import { HttpClient } from '@angular/common/http';

import {
  cilPencil,
  cilTrash,
  cibAddthis,
  cilDataTransferDown,
  cilInfo,
} from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { ApiService } from '../../../api-service.service';

import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import 'moment/locale/th.js';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

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

@Component({
  selector: 'app-recordascount',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    MatPaginatorModule,
    MatTableModule,
    ButtonDirective,
    NgStyle,
  ],
  templateUrl: './recordascount.component.html',
  styleUrl: './recordascount.component.scss'
})
export class RecordascountComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns2: string[] = [
    'การดำเนินการ',
    'วันเดือนปี',
    'รหัสครุภัณฑ์',
    'รายการ',
    'ราคาต่อหน่วย',
    'วิธีการได้มา',
    'เลขที่เอกสาร',
    'แผนก',
    'ที่อยู่',
    'ผู้ใช้งาน',
    'หมายเหตุ',
  ];

  displayedColumns: string[] = [
    'purchaseDate',
    'assetCode',
    'assetName',
    'purchasePrice',
    'purchasedFrom',
    'documentNumber',
    'department',
    'assetLocation',
    'responsibleEmployee',
    'note',
  ];

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  userinfo: any = [];
  token: any;

  readinfo() {
    this.token = localStorage.getItem('token');

    const decodedToken = jwtDecode(this.token);

    this.userinfo = decodedToken;
    // console.log(this.userinfo);
  }

  assetDetails: AssetDetails[] = [];

  dataSource: MatTableDataSource<AssetDetails> =
    new MatTableDataSource<AssetDetails>(this.assetDetails);

  private dataSubscription!: Subscription;

  ngOnInit(): void {
    this.getAssetDetails();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.readinfo();
    this.getAssetDetails();
  }

  getAssetDetails(): void {
    this.dataSubscription = this.apiService
      .fetchDatahttp('assetDetails')
      .subscribe((data) => {
        // console.log(this.userinfo.affiliation);
        this.assetDetails = data
          .filter((asset: any) =>
            asset.assetCode.startsWith(this.userinfo.affiliation)
          )
          .sort((a: any, b: any) => {
            // Convert dates to timestamp for comparison
            const dateA = new Date(a.purchaseDate).getTime();
            const dateB = new Date(b.purchaseDate).getTime();
            // Sort in descending order (latest date first)
            return dateB - dateA;
          })
          .map((asset: any) => {
            asset.purchaseDate = this.convertDate(asset.purchaseDate);
            asset = this.translateToThai(asset);
            return asset;
          });

        // Update the data source with the new asset details
        this.dataSource.data = this.assetDetails;
      });
  }

  addasset(): void {
    window.location.href = '#/system/AssetDetails';
  }

  infoasset(asset: any): void {
    window.location.href = `#/system/infoasset/${asset.assetId}`;
  }

  editAsset(asset: any): void {
    window.location.href = `#/system/Editasset/${asset.assetId}`;
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      purchaseDate: 'วันเดือนปี',
      assetCode: 'รหัสครุภัณฑ์',
      assetName: 'รายการ',
      purchasePrice: 'ราคาต่อหน่วย',
      purchasedFrom: 'วิธีการได้มา',
      documentNumber: 'เลขที่เอกสาร',
      assetLocation: 'ที่อยู่',
      department: 'แผนก',
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

  setupFilter(column: string) {
    const isPriceColumn = column === 'ราคาต่อหน่วย';

    this.dataSource.filterPredicate = (d: AssetDetails, filter: string) => {
      const textToSearch = d[column];
      if (typeof textToSearch === 'string') {
        return isPriceColumn
          ? textToSearch.includes(filter)
          : textToSearch.toLowerCase().includes(filter);
      } else if (typeof textToSearch === 'number') {
        return textToSearch.toString().includes(filter);
      } else {
        return false; // or some other default behavior
      }
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  deleteAsset(asset: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        // ผู้ใช้ยืนยันแล้ว ดำเนินการลบ
        this.http
          .delete(`https://localhost:7204/api/AssetDetails/${asset.assetId}`)
          .subscribe(
            () => {
              const index = this.assetDetails.findIndex(
                (a) => a.assetId === asset.assetId
              );
              if (index !== -1) {
                this.assetDetails.splice(index, 1);
                // Update the data source after deletion
                this.dataSource.data = this.assetDetails;
              }
              Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
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
        Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณปลอดภัย :)', 'info');
      }
    });
  }

  formatCurrency(price: number): string {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  exportExcel(): void {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Assets');

    // Add headers
    const headers = [
      'วันเดือนปี',
      'รหัสครุภัณฑ์',
      'รายการ',
      'ราคาต่อหน่วย',
      'วิธีการได้มา',
      'เลขที่เอกสาร',
      'แผนก',
      'ผู้ใช้งาน',
      'หมายเหตุ',
    ];
    worksheet.addRow(headers);

    // Add data
    this.assetDetails.forEach((asset: any) => {
      // ใช้ any หรือ interface ที่ไม่ได้ระบุก็ได้
      const row = [];
      row.push(asset.วันเดือนปี);
      row.push(asset.รหัสครุภัณฑ์);
      row.push(asset.รายการ);
      row.push(this.formatCurrency(asset.ราคาต่อหน่วย));
      row.push(asset.วิธีการได้มา);
      row.push(asset.เลขที่เอกสาร);
      row.push(asset.แผนก);
      row.push(asset.ผู้ใช้งาน);
      row.push(asset.หมายเหตุ);
      worksheet.addRow(row);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assets.xlsx';
      a.click();
    });
  }
}

