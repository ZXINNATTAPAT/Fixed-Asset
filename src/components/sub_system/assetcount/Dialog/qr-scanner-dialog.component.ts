import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { BarcodeFormat } from '@zxing/library';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-qr-scanner-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ZXingScannerModule,MatOption,MatSelect,MatLabel,MatDialogActions,MatFormField,MatDialogContent],
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
export class QrScannerDialogComponent implements OnInit, AfterViewInit {
  allowedFormats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;

  isMobile: boolean = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // ✅ เพิ่มตรงนี้

  dialogRef = inject(MatDialogRef<QrScannerDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.getAvailableDevices();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.availableDevices.length > 0 && !this.isMobile) {
        this.selectedDevice = this.availableDevices[0]; // บนคอม: กล้องหน้า
      }
    }, 500);
  }

  private getAvailableDevices(): void {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.availableDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('📷 พบกล้องทั้งหมด:', this.availableDevices);

        if (this.availableDevices.length > 1 && this.isMobile) {
          this.selectedDevice = this.availableDevices[1]; // มือถือ: กล้องหลัง
          console.log('📱 ตั้งค่ากล้องหลัง:', this.selectedDevice.label);
        } else {
          this.selectedDevice = this.availableDevices[0]; // fallback
          console.log('💻 ตั้งค่ากล้องเริ่มต้น:', this.selectedDevice?.label || 'ไม่ระบุ');
        }
      })
      .catch(error => console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์:', error));
  }

  onScanSuccess(data: string): void {
    console.log('✅ QR Code Data:', data);
    this.dialogRef.close(data);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

