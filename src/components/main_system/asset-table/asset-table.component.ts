import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import { TextColorDirective ,FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective} from '@coreui/angular';
import { CommonModule, DatePipe, NgIf, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import 'moment/locale/th.js';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import QRCode from 'qrcode';
import { myFunction } from './utils';
import { DataService } from '../../../data-service/data-service.component';
import { MatDialog } from '@angular/material/dialog';
import { EditAssetDialog } from './Dialog/edit-dialog/edit-dialog.component';
import { InfoassetComponent } from '../infoasset/infoasset.component';
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DialogMessageComponent, TrashComponent, TrashDialogWrapper } from './Dialog/TrashComponent/TrashDialog';
import { MatIconModule } from '@angular/material/icon';
import jsPDF from 'jspdf';

interface AssetDetails {
  AssetId: any;
  PurchaseDate: string;
  AssetCode: string;
  AssetName: string;
  TypeId:number;
  CategoryId:number;
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
    NgxMatSelectSearchModule,
    DialogMessageComponent,
    MatIconModule,
    NgStyle,NgIf
  ],
  templateUrl: './asset-table.component.html',
  styleUrl: './asset-table.component.scss',
})
export class AssetTableComponent implements OnInit, OnDestroy, AfterViewInit {

  private _onDestroy = new Subject<void>(); // ✅ เพิ่มตรงนี้

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  assets: AssetDetails[] = []; // แก้จาก any = {} เป็น array
  
  qrCodeUrl: string = '';

  selectedAssetType: number = 0;
  selectedCategoryId: number = 0 ;

  displayedColumns: string[];  //Eng
  displayedColumns1: string[]; //ทั้งหมด
  displayedColumns2: string[]; //ไว้เรียงข้อมูลในตาราง
  displayedColumns3!: string[]; //ไว้จัด Header row & col

  myFunctionInstance: myFunction | undefined;

  assetDetails: AssetDetails[] = [];
  icons = {};
  userinfo: any = [];
  assetTypes: any[] = [];

  assetCategory: any[] = [];
  filteredCategoryList: any[] = [];

  userRoles: string[] = [];

  categoryCtrl: FormControl = new FormControl();
  categoryFilterCtrl: FormControl = new FormControl();

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
  }
  
  ngAfterViewInit() {this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort;} 

  onAssetTypeChange(): void {this.filterAssets();}// เรียกเมื่อประเภท Asset เปลี่ยน

  ngOnDestroy(): void {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    this._onDestroy.next();     // ✅ แจ้งว่า component จะถูกทำลาย
    this._onDestroy.complete(); // ✅ ปิด stream เพื่อไม่ให้ memory leak
  }
  
  ngOnInit(): void {
    this.initializeUserInfo();

    this.loadAssetTypes();

    // this.getAssetDetails();

    this.loadAssetCategory(); 
    
    this.categoryFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.filterCategoryList();
    });}
    
    // โหลดข้อมูล UserInfo
    private async initializeUserInfo(): Promise<void> {
      this.dataService.userInfo$.subscribe(userInfo => {
        if (userInfo) {
          this.userinfo = userInfo.claims;
          this.getAssetDetails();// ✅ เมื่อโหลด UserInfo เสร็จแล้ว ค่อยโหลด Asset Details
        }
      });    

    this.apiService.authService.getUserRole().subscribe(res => {
      this.userRoles = res.roles;
    });
  }

  // ✅ ช่วยเช็กว่าเป็นเจ้าหน้าที่ทั่วไปหรือไม่
  isGeneralStaffOnly(): boolean {
    return this.userRoles.includes('เจ้าหน้าที่ทั่วไป') && this.userRoles.length === 1;
  }
  
  // โหลดข้อมูล Asset Details
  private getAssetDetails(): void {
    // this.apiService.assetService.fetchData(`AssetDetails/GetForTable?deptId=${this.userinfo.DeptId}`).subscribe({
    this.apiService.assetService.fetchData(`AssetDetails/GetForTable`).subscribe({
      next: (data) => this.handleAssetDetails(data),
      error: (err) => console.error('Error loading Asset Details:', err),
    });
  }

  // โหลดข้อมูล Asset Types
  private loadAssetTypes(): void {
    this.apiService.assetService.fetchData('Assettype').subscribe({
      next: (data) => (this.assetTypes = data),
      error: (err) => console.error('Error loading Asset Types:', err),
    });
  }

  private loadAssetCategory(): void {
    this.apiService.assetService.fetchData('Assetcategories').subscribe({
      next: (data) => {
        this.assetCategory = data;
        this.filteredCategoryList = data.slice(); // ✅ ทำสำเนาเพื่อให้กรองได้
      },
      error: (err) => console.error('Error loading Asset Categories:', err),
    });
  }
  
  // ฟิลเตอร์ Asset ตามประเภท
  filterAssets(): void {
    this.dataSource.data = this.selectedAssetType
      ? this.assetDetails.filter((asset) => asset.TypeId === this.selectedAssetType)
      : this.assetDetails;
  }

  filterByCategory(): void {
    this.dataSource.data = this.selectedCategoryId
      ? this.assetDetails.filter(asset => asset.CategoryId === this.selectedCategoryId)
      : this.assetDetails;
  }

  filterCategoryList(): void {
    const search = this.categoryFilterCtrl.value?.toLowerCase() || '';
    this.filteredCategoryList = this.assetCategory.filter(cat =>
      cat.CategoryName.toLowerCase().includes(search)
    );
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
  
  editDialog(assetId: number): void {
    const dialogRef = this.dialog.open(EditAssetDialog, {
      width: '1200px',
      data: { id: assetId } // ส่งค่าไปให้ Dialog
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
      const textToSearch = (d as any)[column];
      if (typeof textToSearch === 'string') {
        return isPriceColumn
          ? textToSearch.includes(filter)
          : textToSearch.toLowerCase().includes(filter);
      } else if (typeof textToSearch === 'number') {
        return textToSearch.toString().includes(filter);
      } else {
        return false;
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
    this.apiService.assetService.fetchData('AssetDetails/' + asset.AssetId)
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


  generatePdfWithQrCodes(): void {
    const doc = new jsPDF();
  
    // ตั้งค่าหัวเรื่อง
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Asset Registry with QR Code', 105, 15, { align: 'center' });
  
    // กำหนดค่าการจัดวางแบบ Grid
    const itemsPerRow = 3;      // จำนวนรายการต่อแถว
    const itemsPerPage = 9;     // จำนวนรายการต่อหน้า
    const qrSize = 60;          // ขนาด QR Code (60x60)
    const marginX = 5;         // ระยะห่างข้างบนซ้ายจากขอบหน้า PDF
    const marginY = 10;
    const gapX = 70;            // ช่องว่างแนวนอนระหว่างแต่ละ QR
    const gapY = 80;            // ช่องว่างแนวตั้งระหว่างแต่ละแถว
  
    // สร้างคำสั่ง generate QR Code ทีละรายการ (แบบ asynchronous)
    const qrCodePromises = this.assetDetails.map((asset, index) => {
      // ดึงค่าจาก asset ให้ยืดหยุ่น (ใช้ as any กับ key ภาษาไทย)
      const assetId = asset.AssetId ?? asset.TypeId ?? 'unknown';
      const assetCode = asset.AssetCode ?? (asset as any)['รหัสครุภัณฑ์'] ?? 'N/A';
      const assetName = asset.AssetName ?? (asset as any)['ชื่อครุภัณฑ์'] ?? 'N/A';
      const qrCodePath = `${this.apiService.apiUrl_link}system/infoasset/${assetId}`;
  
      return new Promise<void>((resolve, reject) => {
        QRCode.toDataURL(qrCodePath, (err, url) => {
          if (err) {
            console.error('Error generating QR code:', err);
            reject(err);
            return;
          }
  
          // คำนวณตำแหน่งบนหน้า PDF แบบ Grid
          const pageIndex = Math.floor(index / itemsPerPage);
          const itemIndex = index % itemsPerPage;
          const col = itemIndex % itemsPerRow;
          const row = Math.floor(itemIndex / itemsPerRow);
  
          const x = marginX + col * gapX;
          // รวม marginY, gapY และ offset สำหรับหัวเรื่อง (เช่น +10)
          const y = marginY + row * gapY + 10;
  
          // ถ้าเป็นรายการแรกของหน้าใหม่ ให้เพิ่มหน้าใหม่และ re-add header
          if (itemIndex === 0 && pageIndex > 0) {
            doc.addPage();
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Asset Registry with QR Code', 105, 15, { align: 'center' });
          }
  
          // ตั้งค่าฟอนต์สำหรับข้อความด้านล่าง QR Code
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
  
          // วางข้อความ ASCODE: ให้อยู่ตรงกลางใต้ QR Code
          doc.text(`${assetCode}`, x + qrSize / 2, y + qrSize + 5, { align: 'center' });
          // หากต้องการแสดง ASNAME ด้วย ให้เปิดบรรทัดด้านล่างนี้:
          // doc.text(`ASNAME: ${assetName}`, x + qrSize / 2, y + qrSize + 12, { align: 'center' });
  
          // เพิ่ม QR Code image ลงในตำแหน่งที่คำนวณไว้
          doc.addImage(url, 'PNG', x, y, qrSize, qrSize);
  
          resolve();
        });
      });
    });
  
    // รอให้ทุก QR Code ถูก generate แล้วบันทึก PDF
    Promise.all(qrCodePromises)
      .then(() => {
        doc.save('Asset_QR_Codes.pdf');
      })
      .catch((error) => {
        console.error('Error generating QR codes for PDF:', error);
      });
  }
  
  // ตัวอย่าง method export Excel ที่มีแค่ QR Code
exportExcelWithQrCodes(): void {
  // สร้าง workbook และ worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('QR Codes');

  // กำหนด grid layout
  const itemsPerRow = 3; // จำนวน QR Code ต่อแถว
  const qrSize = 100;    // ความกว้าง/สูงของรูป QR (หน่วยเป็น pixel)
  const colWidth = 15;   // กำหนดความกว้างคอลัมน์ (ปรับตามที่เหมาะ)
  const rowHeight = 80;  // กำหนดความสูงแถว (ปรับตามที่เหมาะ)

  // ตั้งค่าความกว้างของคอลัมน์ใน worksheet
  for (let i = 1; i <= itemsPerRow; i++) {
    worksheet.getColumn(i).width = colWidth;
  }

  // สร้าง array ของ promises สำหรับ QR Code generation
  const qrCodePromises = this.assetDetails.map((asset, index) => {
    const assetId = asset.AssetId ?? asset.TypeId ?? 'unknown';
    const qrCodePath = `${this.apiService.apiUrl_link}system/infoasset/${assetId}`;

    return new Promise<{ index: number; base64: string }>((resolve, reject) => {
      QRCode.toDataURL(qrCodePath, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          reject(err);
        } else {
          resolve({ index, base64: url });
        }
      });
    });
  });

  // เมื่อ QR Code ทั้งหมด generate เสร็จแล้ว
  Promise.all(qrCodePromises)
    .then((results) => {
      // วนลูปแต่ละรายการที่ generate แล้ว
      results.forEach((result) => {
        // เพิ่มรูปภาพลงใน workbook (ExcelJS ต้องการ base64 และ extension)
        const imageId = workbook.addImage({
          base64: result.base64,
          extension: 'png',
        });

        // คำนวณตำแหน่ง grid ของ QR Code ใน Excel:
        // เราจะใช้ row และ column แบบเลข 1-based
        const rowNumber = Math.floor(result.index / itemsPerRow) + 1;
        const colNumber = (result.index % itemsPerRow) + 1;

        // เราสามารถกำหนดตำแหน่งรูปได้ด้วย option แบบ "tl" (top-left) และ "ext" (extension size)
        // ค่าที่กำหนดไว้ใน "tl" จะเป็นตำแหน่งเริ่มต้น และ "ext" เป็นความกว้างและสูงของรูป
        worksheet.addImage(imageId, {
          tl: { col: colNumber - 1 + 0.2, row: rowNumber - 1 + 0.2 },
          ext: { width: qrSize, height: qrSize },
        });

        // เพิ่มการปรับความสูงของแถวให้พอเหมาะ (ExcelJS ใช้ row.height เป็นค่าในหน่วย points)
        const currentRow = worksheet.getRow(rowNumber);
        currentRow.height = rowHeight; // กำหนดความสูงแถว
      });

      // เขียน workbook ลง buffer แล้วดาวน์โหลดเป็น Excel file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Asset_QR_Codes.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    })
    .catch((error) => {
      console.error('Error generating QR codes for Excel:', error);
    });
}
  // Method สำหรับให้ผู้ใช้เลือกว่าจะ Export เป็น PDF หรือ Excel
exportQrCodes(): void {
  Swal.fire({
    title: 'เลือกฟอร์แมตการ Export',
    text: 'คุณต้องการ Export เป็น PDF หรือ Excel?',
    icon: 'question',
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: 'PDF',
    denyButtonText: 'Excel',
  }).then((result) => {
    if (result.isConfirmed) {
      this.generatePdfWithQrCodes();
    } else if (result.isDenied) {
      this.exportExcelWithQrCodes();
    }
  });
}

  
  
  
  
  

  // ลบสินทรัพย์แบบ Soft Delete
  // async deleteAsset(asset: any): Promise<void> {
  //   const result = await Swal.fire({
  //     title: 'คุณแน่ใจหรือไม่?',
  //     text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'ใช่',
  //     cancelButtonText: 'ไม่',
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       await this.apiService.assetService.deleteData(`AssetDetails/${asset.AssetId}`); // soft delete endpoint
  //       const index = this.assetDetails.findIndex((a) => a.AssetId === asset.AssetId);
  //       if (index !== -1) {
  //         this.assetDetails.splice(index, 1); // เอาออกจากหน้าแสดงผล (ไม่ลบจริง)
  //         this.dataSource.data = this.assetDetails; // อัปเดตตาราง
  //       }
  //       Swal.fire('ลบแล้ว!', 'สินทรัพย์ถูกย้ายไปถังขยะแล้ว', 'success');
  //     } catch (error) {
  //       console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
  //       Swal.fire('ข้อผิดพลาด!', 'ไม่สามารถลบสินทรัพย์ได้', 'error');
  //     }
  //   } else if (result.dismiss === Swal.DismissReason.cancel) {
  //     Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณยังคงอยู่', 'info');
  //   }
  // }

  //ลบสินทรัพย์
  async deleteAsset(asset: any): Promise<void> {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ดำเนินการ',
      cancelButtonText: 'ยกเลิก',
    });
  
    if (result.isConfirmed) {
      try {
        await this.apiService.assetService.deleteData(`AssetDetails/${asset.AssetId}`);
  
        // ลบออกจาก list ในตาราง
        const index = this.assetDetails.findIndex((a) => a.AssetId === asset.AssetId);
        if (index !== -1) {
          this.assetDetails.splice(index, 1);
          this.dataSource.data = [...this.assetDetails]; // trigger data update
        }
  
        Swal.fire('ลบสำเร็จ!', 'สินทรัพย์ถูกลบออกเรียบร้อยแล้ว', 'success');
      } catch (error: any) {
        console.error('Error while deleting asset:', error);
  
        if (error.code === 'ERR_NETWORK') {
          Swal.fire('🌐 ข้อผิดพลาดเครือข่าย', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        } else {
          Swal.fire('❌ เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลบสินทรัพย์ได้', 'error');
        }
      }
    } else {
      Swal.fire('ยกเลิกแล้ว', 'ยังไม่มีการลบสินทรัพย์ใด ๆ', 'info');
    }
  }
  

  exportExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets');
  
    const exportColumns = this.displayedColumns3.filter(column =>
      column !== 'Aactions' && column !== 'Qrcode' && column !== 'สถานะ'
    );
  
    // Title row
    const title = 'ทะเบียนคุมครุภัณฑ์';
    const titleRow = worksheet.addRow([title]);
    worksheet.mergeCells(`A1:${String.fromCharCode(65 + exportColumns.length - 1)}1`);
    titleRow.getCell(1).alignment = { horizontal: 'center' };
    titleRow.getCell(1).font = {
      name: 'TH SarabunPSK',
      bold: true,
      size: 14,
    };
    
  
    // Header row (row 2)
    worksheet.addRow(exportColumns);
  
    // จัดกลุ่มตามปีงบประมาณ
    const groupedByYear = this.groupByFiscalYear(this.assetDetails);
  
    let currentRow = 3;
  
    for (const year in groupedByYear) {
      // แถวคั่นปีงบประมาณ (สีเทา)
      const yearRow = worksheet.insertRow(currentRow, [`ประจำปีงบประมาณ ${year}`]);
      worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + exportColumns.length - 1)}${currentRow}`);
      yearRow.getCell(1).font = {
        name: 'TH SarabunPSK',
        bold: true,
      };
      yearRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }, // สีเทาอ่อน
      };
      yearRow.getCell(1).alignment = { horizontal: 'center' };
      currentRow++;
  
      // เพิ่มข้อมูลของปีนั้นๆ
      groupedByYear[year].forEach((asset: any) => {
        const row = exportColumns.map(column =>
          column === 'ราคาต่อหน่วย'
            ? this.myFunctionInstance!.formatCurrency(asset[column])
            : asset[column]
        );
        const dataRow = worksheet.insertRow(currentRow, row);
        dataRow.eachCell(cell => {
          cell.font = {
            name: 'TH SarabunPSK',
          };
        });
        currentRow++;
      });      
    }
  
    // ดาวน์โหลดไฟล์
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
  
  // 🧠 ฟังก์ชันแยกตามปีงบประมาณ (ตัวอย่าง logic นายอาจต้องปรับให้เข้ากับข้อมูลจริง)
  groupByFiscalYear(assets: any[]): { [year: string]: any[] } {
    const grouped: { [year: string]: any[] } = {};
  
    assets.forEach(asset => {
      // ตัวอย่าง: ดึงปีจากรหัสครุภัณฑ์ (เช่น "0313-4-2541" => 2541)
      const match = asset['รหัสครุภัณฑ์']?.match(/(\d{4})$/);
      const year = match ? match[1] : 'ไม่ทราบปี';
  
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(asset);
    });
  
    return grouped;
  }

  openTrashDialog() {
    this.dialog.open(TrashDialogWrapper, {
      width: '800px',
      height: '600px',
    });
  }
  

}
