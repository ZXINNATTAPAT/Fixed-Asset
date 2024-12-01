import {AfterViewInit,Component,OnDestroy,OnInit,ViewChild,} from '@angular/core';
import {FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective, TextColorDirective } from '@coreui/angular';
import { CommonModule, DatePipe, NgIf, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../api-service.service';

import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator ,MatPaginatorModule} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import 'moment/locale/th.js';
// import moment from 'moment';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import QRCode from 'qrcode';
import { myFunction } from './utils';

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
  selector: 'app-tablewiget',
  providers: [DatePipe],
  standalone: true,
  imports: [
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
    MatFormFieldModule,
    MatSelectModule,
    ButtonDirective,
    // ResizedDirective,
    NgStyle,
  ],
  templateUrl: './tablewiget.component.html',
  styleUrl: './tablewiget.component.scss',
})

export class TablewigetComponent implements OnInit, OnDestroy, AfterViewInit {
 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  assets: any = {};
  qrCodeUrl: string = '';
  selectedAssetType: string = '';
  displayedColumns: string[];  //Eng
  displayedColumns1: string[]; //ทั้งหมด
  displayedColumns2: string[]; //ไว้เรียงข้อมูลในตาราง
  displayedColumns3!: string[]; //ไว้จัด Header row & col
  icons = {};
  userinfo: any = [];
  assetTypes: any[] = [];
  myFunctionInstance: myFunction | undefined;
  assetDetails: AssetDetails[] = [];
  dataSource: MatTableDataSource<AssetDetails> =
    new MatTableDataSource<AssetDetails>(this.assetDetails);

  private dataSubscription!: Subscription;
  
  constructor(private apiService: ApiService) {
    this.myFunctionInstance = new myFunction(apiService);
    this.icons = this.myFunctionInstance.icons;
    this.userinfo = this.myFunctionInstance.readInfo();
    this.displayedColumns3 = this.myFunctionInstance.displayedColumns3;
    this.displayedColumns2 = this.myFunctionInstance.displayedColumns2;
    this.displayedColumns1 = this.myFunctionInstance.displayedColumns1;
    this.displayedColumns = this.myFunctionInstance.displayedColumns;
    this.getAssetDetails();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.getAssetDetails();
    this.apiService.fetchDatahttp('Assettype').subscribe((data) => {
      this.assetTypes = data;
    });
  }

  getAssetDetails(): void {
    this.dataSubscription = this.apiService
      .fetchDatahttp('assetDetails')
      .subscribe((data) => {
        this.processAssetData(data);
      });
  }

  processAssetData(data: any[]): void {
    this.assetDetails = data
      .filter((asset: any) => {
        const agency = asset.agency || '';
        const assetCode = asset.assetCode || '';

        if (this.userinfo.Affiliation === 'ส่วนกลาง') {
          return assetCode.startsWith('กกต') && !assetCode.startsWith('กกต.');
        } else {
          return assetCode.startsWith(this.userinfo.affiliation);
        }
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.purchaseDate).getTime();
        const dateB = new Date(b.purchaseDate).getTime();
        return dateB - dateA;
      })
      .map((asset: any) => {
        asset.purchaseDate = this.myFunctionInstance!.convertDate(asset.purchaseDate);
        asset = this.myFunctionInstance!.translateToThai(asset);
        const path =
          'http://localhost:4200/#/system/infoasset/' + asset.assetId;
        QRCode.toDataURL(path, (err, url) => {
          if (err) throw err;
          asset.qrCodeUrl = url;
        });
        return asset;
      });

    this.filterAssets();
  }

  filterAssets(): void {
    if (this.selectedAssetType) {
      this.dataSource.data = this.assetDetails.filter(
        (asset) => asset['assetType'] === this.selectedAssetType
      );
    } else {
      this.dataSource.data = this.assetDetails;
    }
  }

  onAssetTypeChange(): void {
    this.filterAssets();
  }

  toggleColumn(event: MatSelectChange) {
    const selectedColumns = event.value;
    if (selectedColumns.includes('เซตค่าคืนทั้งหมด')) {
      this.displayedColumns3 = ['Aactions', ...this.displayedColumns2];
    } else {
      // เลือกคอลัมน์ที่เลือกโดยไม่รวม "เซตค่าคืนทั้งหมด"
      this.displayedColumns3 = [
        'Aactions',
        ...selectedColumns.filter(
          (column: string) => column !== 'เซตค่าคืนทั้งหมด'
        ),
      ];
    }
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

  showQrAsset(asset: any): void {
    this.apiService
      .fetchDatahttp('AssetDetails/' + asset.assetId)
      .subscribe((data: any) => {
        this.assets = data;

        const path =
          `${this.apiService.apiUrl_link}system/infoasset/` + asset.assetId;
        QRCode.toDataURL(path, (err, url) => {
          if (err) throw err;
          // นำ URL ของ QR code ไปใช้งานต่อ
          // console.log('QR code URL:', url);
          this.qrCodeUrl = url;
          // ในที่นี้คุณสามารถส่ง URL ไปยัง HTML template เพื่อแสดงผลได้
        });
      });
  }

  async deleteAsset(asset: any): Promise<void> {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    });
  
    if (result.isConfirmed) {
      try {
        // Call API to delete asset
        await this.apiService.deleteData(`AssetDetails/${asset.assetId}`);
  
        // Ensure assetDetails is an array
        if (!Array.isArray(this.assetDetails)) {
          console.error('assetDetails is not an array:', this.assetDetails);
          Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์', 'error');
          return;
        }
  
        // Remove the asset from the list
        const index = this.assetDetails.findIndex((a) => a.assetId === asset.assetId);
        if (index !== -1) {
          this.assetDetails.splice(index, 1);
          this.dataSource.data = [...this.assetDetails]; // Update data source
        }
  
        Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
        Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์', 'error');
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณปลอดภัย :)', 'info');
    }
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
      'หน่วยงาน',
      'ฝ่าย',
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
      row.push(this.myFunctionInstance!.formatCurrency(asset.ราคาต่อหน่วย));
      row.push(asset.วิธีการได้มา);
      row.push(asset.เลขที่เอกสาร);
      row.push(asset.หน่วยงาน);
      row.push(asset.ฝ่าย);
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