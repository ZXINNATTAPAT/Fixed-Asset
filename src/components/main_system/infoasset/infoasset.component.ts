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
import { DepreciationService } from '../asset-detail1/Service/depreciation.service';

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
    @Inject(MAT_DIALOG_DATA) public datadialog: any,
    private ap: ApiService,
    private route: ActivatedRoute,
    private depreciationService: DepreciationService
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
    const asset = this.assets;
    const purchasePrice = asset.PurchasePrice;
    const depreciationRate = parseFloat(asset.Rate_dep); // อัตราร้อยละ เช่น 25
    const receiptDate = asset.ReceiptDate;
    const serviceLife = parseInt(asset.Servicelife); // อายุการใช้งาน เช่น 4 ปี
  
    if (!purchasePrice || !depreciationRate || !receiptDate || !serviceLife) return 0;
  
    // 🔁 เรียกใช้ฟังก์ชันที่คุณเขียนไว้
    const depreciationData = this.depreciationService.calculateDepreciationWithPartialYear(
      purchasePrice,
      depreciationRate,
      receiptDate,
      serviceLife
    );
  
    // ✅ รวมค่าเสื่อมราคาสะสมจนถึงปัจจุบัน
    const accumulatedDepreciation = depreciationData.reduce((sum, year) => sum + year.depreciation, 0);
    // console.log('depreciationData:', depreciationData);
    // const accumulatedDepreciation = depreciationData.accumulatedDepreciation;
  
    return Math.round(accumulatedDepreciation * 100) / 100;
  }
  
  


}
