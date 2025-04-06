import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { MatCommonModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ExcelPreviewHelper } from '../../Service/excel-preview.helper';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatDialogActions, 
    MatDialogContent, 
    MatCommonModule, 
    MatButtonModule,
    CommonModule], 
})
export class UploadDialogComponent {
  selectedFile: File | null = null;
  asset2: any[] = [];
  assetCategory: any[] = [];
  assetTypes: any[] = [];
  departments: any[] = [];
  validationFlags: { departmentError: boolean; factionError: boolean }[] = [];

  public data = inject(MAT_DIALOG_DATA);  // ✅ inject data แบบใหม่
  private dialogRef = inject(MatDialogRef<UploadDialogComponent>);
  private ap = inject(ApiService);

  ngOnInit() {
    // ✅ ดึงค่าจาก data ที่ inject มา
    this.assetCategory = this.data.assetCategory || [];
    this.assetTypes = this.data.assetTypes || [];
    this.departments = this.data.departments || [];
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
  
    if (file) {
      ExcelPreviewHelper.parseExcel(file)
        .then((rows) => {
          const result = ExcelPreviewHelper.validateDataAgainstMaster(rows, this.departments);
          
          // ✅ แปลงชื่อ field ภาษาไทย → ภาษาอังกฤษ
          this.asset2 = result.data.map(row => ExcelPreviewHelper.translateToEnglish(row));
  
          this.validationFlags = result.validationFlags;
          console.log(' validationFlags:', this.validationFlags);
          console.log('🔎 Preview Row 0:', this.asset2[0]);
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error importing Excel',
            text: 'Please check your file and try again.',
            icon: 'error',
          });
        });
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.validateUniqueAssetCodes(this.asset2)) return;
  
    for (const asset of this.asset2) {
      if (!this.validateAsset(asset)) return;
    }
  
    // 👉 ส่งข้อมูลแบบรวมทั้งหมดในครั้งเดียว
    try {
      const response = await firstValueFrom(
        await this.ap.assetService.postData('AssetDetails/bulk', this.asset2)
      );
  
      Swal.fire({
        title: '✅ สำเร็จ',
        text: 'บันทึกข้อมูลครุภัณฑ์เรียบร้อยแล้ว',
        icon: 'success',
      });
  
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    } catch (error: any) {
      if (error.status === 409) {
        // รหัสครุภัณฑ์ซ้ำ (AssetCode duplicated)
        Swal.fire({
          title: '🚫 รหัสครุภัณฑ์ซ้ำ',
          text: error.error?.Message || 'มีรหัสครุภัณฑ์ซ้ำในระบบ',
          icon: 'error',
        });
      } else {
        Swal.fire({
          title: '❌ เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          icon: 'error',
        });
      }
    }
  }
  

  validateAsset(asset: any): boolean {
    if (typeof asset.note === 'number') {
      asset.note = asset.note.toString();
    }
    if (
      asset.purchaseDate &&
      asset.assetCode &&
      asset.assetName &&
      asset.purchasePrice > 0
    ) {
      return true;
    } else {
      Swal.fire({
        title: 'Invalid Data',
        text: `Asset Code: ${asset.assetCode} is incomplete or invalid.`,
        icon: 'error',
      });
      return false;
    }
  }

  validateUniqueAssetCodes(assets: any[]): boolean {
    const assetCodeSet = new Set();
    for (const asset of assets) {
      if (assetCodeSet.has(asset.assetCode)) {
        Swal.fire({
          title: 'Duplicate Data',
          text: `Asset Code: ${asset.assetCode} is duplicated in the imported file.`,
          icon: 'error',
        });
        return false;
      }
      assetCodeSet.add(asset.assetCode);
    }
    return true;
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
