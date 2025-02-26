import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';
import { MatTabsModule } from '@angular/material/tabs';
import {HistoryComponent} from '../history/history.component'
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  imports: [MatTabsModule ,HistoryComponent,CommonModule],
  templateUrl: './infoasset.component.html',
  styleUrl: './infoasset.component.scss',
})
export class InfoassetComponent {

  // assetDetails: AssetDetails[] = [];
  // assets: any = {};
  // qrCodeUrl: string = '';

  assetId!: number;
  assets: any;
  qrCodeUrl!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // อนุญาตให้รับค่าได้ทั้ง object หรือ undefined
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('ค่าที่ได้รับจาก Dialog:', this.data);

    // ตรวจสอบว่ามีค่า id มาจาก Dialog หรือไม่
    if (this.data?.id) {
      this.assetId = this.data.id; // ใช้ค่า id จาก Dialog
    } else {
      // ถ้าไม่มีค่า id จาก Dialog ให้ดึงจาก URL params แทน
      this.route.params.subscribe((params) => {
        if (params['assetId']) {
          this.assetId = params['assetId'];
        }
      });
    }

    if (this.assetId) {
      // เรียกข้อมูล AssetDetails จาก API
      this.http.get<any>(`https://localhost:7204/api/AssetDetails/infoasset/${this.assetId}`)
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
    const assetAge = this.assets.AssetAge;

    const purchaseDay = purchaseDate.getDate();
    const purchaseMonth = purchaseDate.getMonth();
    const purchaseYear = purchaseDate.getFullYear();

    // ตรวจสอบว่าวันที่เป็นวันที่ 1-15 ของเดือนหรือไม่
    const isFullMonth = purchaseDay <= 15;

    // กำหนดเดือนเริ่มต้นการคำนวณ
    const startMonth = isFullMonth ? purchaseMonth : purchaseMonth + 1;
    const startYear = isFullMonth ? purchaseYear : (startMonth > 11 ? purchaseYear + 1 : purchaseYear);

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
