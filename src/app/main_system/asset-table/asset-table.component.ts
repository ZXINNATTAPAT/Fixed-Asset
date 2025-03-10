import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import { TextColorDirective ,FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective} from '@coreui/angular';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../ApiController/api-service.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import 'moment/locale/th.js';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import QRCode from 'qrcode';
import { myFunction } from './utils';
import { DataService } from '../../../app/data-service/data-service.component';
import { MatDialog } from '@angular/material/dialog';
import { EditAssetDialog } from './Dialog/edit-dialog/edit-dialog.component';
import { InfoassetComponent } from '../infoasset/infoasset.component';
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';

interface AssetDetails {
  AssetId: any;
  PurchaseDate: string;
  AssetCode: string;
  AssetName: string;
  TypeId:number;
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
    // MatDialog,
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
  
  constructor(private apiService: ApiService ,private dataService :DataService,public dialog: MatDialog) {
    this.myFunctionInstance = new myFunction();
    this.icons = this.myFunctionInstance.icons;
    this.displayedColumns3 = this.myFunctionInstance.displayedColumns3;
    this.displayedColumns2 = this.myFunctionInstance.displayedColumns2;
    this.displayedColumns1 = this.myFunctionInstance.displayedColumns1;
    this.displayedColumns = this.myFunctionInstance.displayedColumns;
    this.getAssetDetails();
  }

  ngAfterViewInit() {this.dataSource.paginator = this.paginator;} 

  onAssetTypeChange(): void {this.filterAssets();}// เรียกเมื่อประเภท Asset เปลี่ยน

  ngOnDestroy(): void {if (this.dataSubscription) this.dataSubscription.unsubscribe();}

  ngOnInit(): void {this.initializeUserInfo();this.loadAssetTypes();this.getAssetDetails();}

  editDialog(): void {
    const dialogRef = this.dialog.open(EditAssetDialog, {
      width: '700px',
      data: { status: 'donation' } // ส่งค่าไปให้ Dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('ผลลัพธ์จาก Dialog:', result);
      }
    });
  }

  assetDialog(assetId: number): void {
    const dialogRef = this.dialog.open(InfoassetComponent, {
      width: '1200px',
      data: { id: assetId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('ผลลัพธ์จาก Dialog:', result);
      }
    });
  }
  
  // โหลดข้อมูล UserInfo
  private async initializeUserInfo(): Promise<void> {
    // await this.dataService.loadUserInfo();
    const userInfo = this.dataService.getUserInfo();
    if (userInfo) {
      this.userinfo = userInfo.claims;
      console.log('UserInfo Loaded:', userInfo);
    } else {
      console.warn('UserInfo not available');
    }
  }
  
  // โหลดข้อมูล Asset Types
  private loadAssetTypes(): void {
    this.apiService.fetchDatahttp('Assettype').subscribe({
      next: (data) => (this.assetTypes = data),
      error: (err) => console.error('Error loading Asset Types:', err),
    });
  }

  // โหลดข้อมูล Asset Details
  private getAssetDetails(): void {
    this.apiService.fetchDatahttp('AssetDetails/GetForTable').subscribe({
      next: (data) => this.handleAssetDetails(data),
      error: (err) => console.error('Error loading Asset Details:', err),
    });
  }
  
  // จัดการข้อมูล Asset Details
  private handleAssetDetails(data: any[]): void {
    this.assetDetails = data
      .filter((asset) => this.filterAssetByAffiliation(asset))
      .sort((a, b) => this.sortByPurchaseDate(a, b))
      .map((asset) => this.transformAsset(asset));
  
    this.dataSource.data = this.assetDetails;
    console.log('Processed Asset Details:', this.assetDetails);
  }
  
  // ฟิลเตอร์ข้อมูล Asset ตาม Affiliation
  private filterAssetByAffiliation(asset: any): boolean {
    const assetCode = asset.AssetCode || '';
    const affiliation = this.userinfo?.Affiliation || '';
  
    return affiliation === 'ส่วนกลาง'
      ? assetCode.startsWith('กกต') && !assetCode.startsWith('กกต.')
      : assetCode.startsWith('กกต');
  }
  
  // จัดเรียงข้อมูล Asset ตามวันที่ซื้อ
  private sortByPurchaseDate(a: any, b: any): number {
    return new Date(b.PurchaseDate).getTime() - new Date(a.PurchaseDate).getTime();
  }
  
  // ฟิลเตอร์ Asset ตามประเภท
  filterAssets(): void {
    this.dataSource.data = this.selectedAssetType
      ? this.assetDetails.filter((asset) => asset.TypeId.toString() === this.selectedAssetType)
      : this.assetDetails;
  }
  
  // สลับคอลัมน์ที่แสดง
  toggleColumn(event: MatSelectChange): void {
    const selectedColumns = event.value;
    this.displayedColumns3 = selectedColumns.includes('เซตค่าคืนทั้งหมด')
      ? ['Aactions', ...this.displayedColumns2]
      : [
          'Aactions',
          ...selectedColumns.filter((column: string) => column !== 'เซตค่าคืนทั้งหมด'),
        ];
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

  // แปลงข้อมูล Asset และสร้าง QR Code
  private transformAsset(asset: any): any {
    asset.PurchaseDate = this.myFunctionInstance?.convertDate(asset.PurchaseDate);
    asset = this.myFunctionInstance?.translateToThai(asset);
  
    const path = `http://localhost:4200/system/infoasset/${asset.AssetId}`;
    QRCode.toDataURL(path, (err, url) => {
      if (err) {
        console.error('QR Code generation error:', err);
      } else {
        asset.qrCodeUrl = url;
      }
    });
  
    return asset;
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

  //ลบสินทรัพย์
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
