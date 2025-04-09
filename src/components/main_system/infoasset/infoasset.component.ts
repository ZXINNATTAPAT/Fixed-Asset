import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import QRCode from 'qrcode';
import { MatTabContent, MatTabsModule } from '@angular/material/tabs';
import { HistoryComponent } from '../history/history.component'
import { CommonModule, NgStyle } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { SubAssetDialogComponent } from './Subasset/subasset/subasset.component';
import { RepairAssetComponent } from './repair-history/repair-history/repair-history.component';

interface AssetDetails {
  assetId: any;
  purchaseDate: string;
  assetCode: string;
  assetName: string;
  quantity: string;
  unit: string;
  assetType: string;
  assetCategory: string;
  department: string;
  agency: string;
  assetLocation: string;
  taxInvoiceNumber: string;
  assetAge: string;
  ReceiptDate: string;
  DepreciationStartDate: string;
  DepreciationCalculationStartDate: string;
  purchasePrice: number;
  purchasedFrom: string;
  documentNumber: string;
  responsibleEmployee: string;
  Note: string;
  [key: string]: string | number;
  // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
}

@Component({
  selector: 'app-infoasset',
  standalone: true,
  imports: [
    MatTabsModule,
    HistoryComponent,
    CommonModule,
    SubAssetDialogComponent,
    MatTabContent,
    MatDialogContent,
    MatDialogModule,
    NgStyle,
    RepairAssetComponent],
  templateUrl: './infoasset.component.html',
  styleUrl: './infoasset.component.scss',
})
export class InfoassetComponent {

  assetId!: number;
  assets: any;
  qrCodeUrl!: string;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadMessage: string | null = '';
  assetImages: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public datadialog: any, // อนุญาตให้รับค่าได้ทั้ง object หรือ undefined
    private ap: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    // ตรวจสอบว่ามีค่า id มาจาก Dialog หรือไม่
    if (this.datadialog?.id) {
      this.assetId = this.datadialog.id; // ใช้ค่า id จาก Dialog
    }
    else {
      // ถ้าไม่มีค่า id จาก Dialog ให้ดึงจาก URL params แทน
      this.route.params.subscribe((params) => {
        if (params['assetId']) {
          this.assetId = params['assetId'];
        }
      });
    }

    if (this.assetId) {
      // เรียกข้อมูล AssetDetails จาก API
      this.ap.assetService.fetchDataById(`AssetDetails/infoasset`, this.assetId)
        .subscribe((data: any) => {
          this.assets = data;
          console.log('Asset Details:', this.assets);

          // สร้าง QR code จาก URL ของ asset details
          const path = `http://localhost:4200/#/system/infoasset/${this.assetId}`;
          QRCode.toDataURL(path, (err, url) => {
            if (err) throw err;
            this.qrCodeUrl = url; // เก็บ URL ของ QR Code
          });
        });
    }

    if (this.assetId) {
      this.loadAssetImages();
    }

  }

  readonly maxFileSize = 2 * 1024 * 1024; // 2MB

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // ตรวจสอบว่าเป็นรูปภาพ
    if (!file.type.startsWith('image/')) {
      this.uploadMessage = '❌ กรุณาเลือกรูปภาพเท่านั้น';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > this.maxFileSize) {
      this.uploadMessage = '❌ ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 2MB)';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);

    this.uploadMessage = null;
  }


uploadImage() {
  if (!this.selectedFile) {
    this.uploadMessage = '⚠️ กรุณาเลือกรูปก่อนอัปโหลด';
    return;
  }

  if (!this.assetId) {
    this.uploadMessage = '⚠️ ไม่พบรหัสทรัพย์สิน';
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.ap.assetService.postData(`AssetImages/upload/${this.assetId}`, formData)
    .then((res: any) => {
      this.uploadMessage = '✅ อัปโหลดเรียบร้อยแล้ว!';
      this.previewUrl = null;
      this.selectedFile = null;
      this.loadAssetImages(); // โหลดรูปใหม่หลังอัป
    })
    .catch((err: any) => {
      this.uploadMessage = '❌ เกิดข้อผิดพลาดในการอัปโหลด';
      console.error(err);
    });
}


  loadAssetImages() {
    this.ap.assetService.fetchDataById('AssetImages/by-asset', this.assetId).subscribe({
      next: (data: any) => {
        this.assetImages = data;
      },
      error: err => {
        console.error('โหลดรูปไม่สำเร็จ', err);
      }
    });
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

  annualDepreciationRate = 0.25; // อัตราค่าเสื่อมต่อปี

  //ปิดการใช้งานไว้ก่อน
  calculateDepreciation(): number {
    const purchasePrice = this.assets.PurchasePrice;
    const purchaseDate = new Date(this.assets.PurchaseDate);

    const purchaseDay = purchaseDate.getDate();
    const purchaseMonth = purchaseDate.getMonth();
    let purchaseYear = purchaseDate.getFullYear();

    // ตรวจสอบว่าวันที่เป็นวันที่ 1-15 ของเดือนหรือไม่
    const isFullMonth = purchaseDay <= 15;

    // กำหนดเดือนเริ่มต้นการคำนวณ
    const startMonth = isFullMonth ? purchaseMonth : purchaseMonth + 1;
    let adjustedStartMonth = startMonth;
    if (startMonth > 11) {
      adjustedStartMonth = 0; // Reset to January of the next year
      purchaseYear += 1;
    }
    const startYear = isFullMonth ? purchaseYear : adjustedStartMonth;

    // คำนวณจำนวนเดือนที่ใช้งานจนถึงปัจจุบัน
    const currentDate = new Date();
    let monthsUsed = (currentDate.getFullYear() - startYear) * 12 + (currentDate.getMonth() - startMonth + 1);

    if (monthsUsed < 0) {
      monthsUsed = 0;
    }

    // คำนวณค่าเสื่อมราคาสะสม
    const monthlyDepreciationRate = this.annualDepreciationRate / 12;
    const depreciation = monthlyDepreciationRate * monthsUsed * purchasePrice;

    return Math.round(depreciation * 100) / 100; // ปัดเศษทศนิยมสองตำแหน่ง
  }


}
