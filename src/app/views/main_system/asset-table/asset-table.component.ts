import {AfterViewInit,Component,OnDestroy,OnInit,ViewChild,} from '@angular/core';
import { TextColorDirective } from '@coreui/angular';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective,} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../api-service.service';

import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import 'moment/locale/th.js';
// import moment from 'moment';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import QRCode from 'qrcode';
import { myFunction } from './utils';

interface AssetDetails {
  AssetId: any;
  PurchaseDate: string;
  AssetCode: string;
  AssetName: string;
  PurchasePrice: number;
  PurchasedFrom: string;
  DocumentNumber: string;
  Department: string;
  AssetLocation: string;
  ResponsibleEmployee: string;
  Note: string;
  [key: string]: string | number; // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
}

@Component({
  selector: 'app-asset-table',
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
  templateUrl: './asset-table.component.html',
  styleUrl: './asset-table.component.scss',
})
export class AssetTableComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  assets: AssetDetails[] = []; // แก้จาก any = {} เป็น array
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
  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  private dataSubscription!: Subscription;
  
  constructor(private apiService: ApiService) {
    this.myFunctionInstance = new myFunction();
    this.icons = this.myFunctionInstance.icons;
    this.displayedColumns3 = this.myFunctionInstance.displayedColumns3;
    this.displayedColumns2 = this.myFunctionInstance.displayedColumns2;
    this.displayedColumns1 = this.myFunctionInstance.displayedColumns1;
    this.displayedColumns = this.myFunctionInstance.displayedColumns;
    this.getAssetDetails();
    this.readinfo();
    
  }

  readinfo() {
    this.apiService.getUserClaims().subscribe(
      (data) => {
        this.userinfo = data.claims; // ดึง claims จาก Response
        console.log('User Info:', this.userinfo.Affiliation);
      },
      (error) => {
        console.error('Error fetching claims:', error);
        this.userinfo = null;
      }
    );
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
    this.loadAssetTypes();
  }
  
  loadAssetTypes(): void {
    this.apiService.fetchDatahttp('Assettype').subscribe((data) => {
      this.assetTypes = data;
    });
  }
  
  getAssetDetails(): void {
    this.dataSubscription = this.apiService
      .fetchDatahttp('AssetDetails')
      .subscribe((data) => {
        // console.log(data);
        this.processAssetData(data);
        this.dataSource.data = this.assetDetails; // อัปเดต dataSource
        console.log(this.assetDetails);
      });
  }
  
  processAssetData(data: any[]): void {
    this.assetDetails = data
      .filter((asset: any) => this.filterAssetByAffiliation(asset))
      .sort((a: any, b: any) => this.sortByPurchaseDate(a, b))
      .map((asset: any) => this.transformAsset(asset));

    // this.filterAssets(); // เรียกใช้ฟังก์ชันฟิลเตอร์เพิ่มเติมหากมี
  }
  
  filterAssetByAffiliation(asset: any): boolean {
    const AssetCode = asset.AssetCode || '';
    const affiliation = this.userinfo?.Affiliation || ''; // ใช้ optional chaining
    console.log(affiliation);
    return affiliation === "ส่วนกลาง"
      ? AssetCode.startsWith('กกต') && !AssetCode.startsWith('กกต.')
      : AssetCode.startsWith(AssetCode.startsWith('กกต'));
  }
  
  sortByPurchaseDate(a: any, b: any): number {
    const dateA = new Date(a.PurchaseDate).getTime();
    const dateB = new Date(b.PurchaseDate).getTime();
    return dateB - dateA; // เรียงลำดับจากล่าสุดไปเก่าสุด
  }
  
  transformAsset(asset: any): any {
    asset.PurchaseDate = this.myFunctionInstance!.convertDate(asset.PurchaseDate);
    asset = this.myFunctionInstance!.translateToThai(asset);
  
    const path = `http://localhost:4200/#/system/infoasset/${asset.AssetId}`;
    QRCode.toDataURL(path, (err, url) => {
      if (err) console.error('QR Code generation error:', err);
      asset.qrCodeUrl = url;
    });
  
    return asset;
  }
  

  filterAssets(): void {
    // if (this.selectedAssetType) {
    //   this.dataSource.data = this.assetDetails.filter(
    //     (asset) => asset['AssetType'] === this.selectedAssetType
    //   );
    // } else {
    //   this.dataSource.data = this.assetDetails;
    // }
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
    // const isPriceColumn = column === 'ราคาต่อหน่วย';

    // this.dataSource.filterPredicate = (d: AssetDetails, filter: string) => {
    //   const textToSearch = d[column];
    //   if (typeof textToSearch === 'string') {
    //     return isPriceColumn
    //       ? textToSearch.includes(filter)
    //       : textToSearch.toLowerCase().includes(filter);
    //   } else if (typeof textToSearch === 'number') {
    //     return textToSearch.toString().includes(filter);
    //   } else {
    //     return false; // or some other default behavior
    //   }
    // };
  }

  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value
    //   .trim()
    //   .toLowerCase();
    // this.dataSource.filter = filterValue;
  }

  showQrAsset(asset: any): void {
    this.apiService
      .fetchDatahttp('AssetDetails/' + asset.AssetId)
      .subscribe((data: any) => {
        this.assets = data;

        const path =
          `${this.apiService.apiUrl_link}system/infoasset/` + asset.AssetId;
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
        await this.apiService.deleteData(`AssetDetails/${asset.AssetId}`);
        const index = this.assetDetails.findIndex((a) => a.AssetId === asset.AssetId);
        if (index !== -1) {
          this.assetDetails.splice(index, 1);
          // Update the data source after deletion
          this.dataSource.data = this.assetDetails;
        }
        Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
        Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์', 'error');
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // ผู้ใช้ยกเลิก ไม่ต้องกระทำอะไร
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

//   async searchAsset(): Promise<void> {
//     const AssetCode = this.AssetCodeInput;

//     // ใช้เงื่อนไขการเปรียบเทียบค่าที่ต้องการ (เช่น >=, <=, === เป็นต้น) กับค่าที่มีอยู่ในรายการ
//     const foundAsset = this.assetDetailsset.find(asset => {
//         // เช็คว่ารหัสครุภัณฑ์ในรายการเป็นค่าที่คล้ายค่าที่ผู้ใช้ป้อนเข้ามาหรือไม่
//         return asset.รหัสครุภัณฑ์.startsWith(AssetCode) || asset.รหัสครุภัณฑ์.startsWith(AssetCode + "-");
//     });

//     if (foundAsset) {
//         // พบรหัสครุภัณฑ์ในรายการ
//         console.log('Found asset:', foundAsset);
//         this.dataSource = new MatTableDataSource<any>([foundAsset]); // แปลงเป็นอาร์เรย์เดี่ยวแล้วสร้าง MatTableDataSource

//         // ทำอย่างไรก็ได้ตามที่ต้องการกับข้อมูลที่พบ
//     } else {
//         // ไม่พบรหัสครุภัณฑ์ในรายการ
//         console.log('Asset with code', AssetCode, 'not found.');
//         // จัดการกรณีที่ไม่พบรหัสครุภัณฑ์ที่ต้องการ
//     }
// }
