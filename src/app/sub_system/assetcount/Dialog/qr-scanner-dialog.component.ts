import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog'; // ✅ Import MatDialogModule
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ZXingScannerModule], 
  templateUrl: './qr-scanner-dialog.component.html',
  styles: [`
    .qr-scanner-container {
      width: 100%;
      max-height: 400px;
      display: flex;
      justify-content: center;
    }
  `]
})
export class QrScannerDialogComponent implements AfterViewInit {

  allowedFormats: BarcodeFormat[] = [BarcodeFormat.QR_CODE]; // รองรับเฉพาะ QR Code
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;

  constructor(
    private dialogRef: MatDialogRef<QrScannerDialogComponent>,
  ) {}
    
  @Inject(MAT_DIALOG_DATA) public data: any

  ngOnInit(): void {
    this.getAvailableDevices();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.availableDevices.length > 0) {
        this.selectedDevice = this.availableDevices[0]; // เลือกกล้องตัวแรก
      }
    }, 500); // หน่วงเวลาให้ UI โหลดก่อน
  }

  /** 📷 โหลดรายการกล้องที่มีอยู่ */
  private getAvailableDevices(): void {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.availableDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('📷 พบกล้อง:', this.availableDevices);

        if (this.availableDevices.length > 0) {
          this.selectedDevice = this.availableDevices[0]; // ตั้งค่ากล้องตัวแรกโดยอัตโนมัติ
        }
      })
      .catch(error => console.error('เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์:', error));
  }

  /** 📷 เมื่อสแกน QR Code สำเร็จ */
  onScanSuccess(data: string): void {
    console.log('QR Code Data:', data);
    this.dialogRef.close(data); // ปิด Dialog และส่งค่าออกไป
  }

  /** ❌ ปิด Dialog */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
