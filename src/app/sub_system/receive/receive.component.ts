import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import { TextColorDirective ,FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective} from '@coreui/angular';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../ApiController/api-service.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import 'moment/locale/th.js';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import QRCode from 'qrcode';
import { myFunction } from './utils';
import { DataService } from '../../../data-service/data-service.component';
import { MatDialog } from '@angular/material/dialog';
// import { EditAssetDialog } from './Dialog/edit-dialog/edit-dialog.component';
// import { InfoassetComponent } from '../infoasset/infoasset.component';
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
  selector: 'app-receive',
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
  templateUrl: './receive.component.html',
  styleUrl: './receive.component.scss'
})
export class ReceiveComponent {
  
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
  
  constructor(
    private apiService: ApiService ,
    private dataService :DataService,
    public dialog: MatDialog) {
    this.myFunctionInstance = new myFunction();
    this.icons = this.myFunctionInstance.icons;
    this.displayedColumns3 = this.myFunctionInstance.displayedColumns3;
    this.displayedColumns2 = this.myFunctionInstance.displayedColumns2;
    this.displayedColumns1 = this.myFunctionInstance.displayedColumns1;
    this.displayedColumns = this.myFunctionInstance.displayedColumns;
    this.getAssetDetails();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }
  onAssetTypeChange(): void {this.filterAssets();}// เรียกเมื่อประเภท Asset เปลี่ยน
  ngOnDestroy(): void {if (this.dataSubscription) this.dataSubscription.unsubscribe();}
  ngOnInit(): void {this.initializeUserInfo();this.loadAssetTypes();this.getAssetDetails();}

 // โหลดข้อมูล Asset Details
 private getAssetDetails(): void {
  this.apiService.fetchDatahttp('AssetDetails/Receive').subscribe({
    next: (data) => {
      this.dataSource.data = data || []; // ✅ ถ้าไม่มีข้อมูลให้กำหนดเป็น []
      // console.log("📌 Asset data loaded:", this.dataSource.data);
    },
    error: (err) => console.error('Error loading Asset Details:', err),
  });
}


  updateAllStatuses(): void {
    
    if (!this.dataSource || this.dataSource.data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีครุภัณฑ์',
        text: 'ขณะนี้ยังไม่มีการส่งมอบครุภัณฑ์มา',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
  
    const assetIds = this.dataSource.data.map((asset: AssetDetails) => asset.AssetId);
    const updatePayload = { AssetIds: assetIds, StatusId: 2 };
  
    this.apiService.updateData('AssetDetails/UpdateStatusAll', updatePayload)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'อัปเดตสถานะทั้งหมดเรียบร้อยแล้ว!',
          confirmButtonText: 'ตกลง'
        });
        this.getAssetDetails(); // รีโหลดข้อมูลใหม่
      })
      .catch((err) => {
        console.error('❌ Error updating status:', err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: `❌ ${err}`,
          confirmButtonText: 'ตกลง'
        });
      });
  }

  // editDialog(): void {
  //   const dialogRef = this.dialog.open(EditAssetDialog, {
  //     width: '700px',
  //     data: { status: 'donation' } // ส่งค่าไปให้ Dialog
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       console.log('ผลลัพธ์จาก Dialog:', result);
  //     }
  //   });
  // }

  assetDialog(assetId: number): void {
    // const dialogRef = this.dialog.open(InfoassetComponent, {
    //   width: '1200px',
    //   data: { id: assetId }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     console.log('ผลลัพธ์จาก Dialog:', result);
    //   }
    // });
  }
  
  // โหลดข้อมูล UserInfo
  private async initializeUserInfo(): Promise<void> {
    // await this.dataService.loadUserInfo();
    this.dataService.userInfo$.subscribe(userInfo => {
      if (userInfo) {
        this.userinfo = userInfo.claims;
        console.log("✅ UserInfo Loaded:", userInfo);
      } else {
        console.warn("⚠️ UserInfo not available");
      }
    });    
  }
  
  // โหลดข้อมูล Asset Types
  private loadAssetTypes(): void {
    this.apiService.fetchDatahttp('Assettype').subscribe({
      next: (data) => (this.assetTypes = data),
      error: (err) => console.error('Error loading Asset Types:', err),
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
  
    // Remove 'Aactions', 'Qrcode', and 'สถานะ' before creating headers
    const exportColumns = this.displayedColumns3.filter(column => 
      column !== 'Aactions' && column !== 'Qrcode' && column !== 'สถานะ'
    );
  
    // Set Title Row (Merged and Centered)
    const title = 'ทะเบียนคุมครุภัณฑ์'; // Excel title
    const titleRow = worksheet.addRow([title]);
  
    // Merge Title Row across all columns
    worksheet.mergeCells(`A1:${String.fromCharCode(65 + exportColumns.length - 1)}1`);
    titleRow.getCell(1).alignment = { horizontal: 'center' }; // Center align title
    titleRow.getCell(1).font = { bold: true, size: 14 }; // Bold and larger font for title
  
    // Add headers dynamically (in row 2)
    worksheet.addRow(exportColumns);
  
    // Add data rows (starting from row 3)
    this.assetDetails.forEach((asset: any) => {
      const row = exportColumns.map(column => 
        column === 'ราคาต่อหน่วย' 
          ? this.myFunctionInstance!.formatCurrency(asset[column]) 
          : asset[column]
      );
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
      a.download = 'ทะเบียนคุมครุภัณฑ์.xlsx';
      a.click();
    });
  }

}
