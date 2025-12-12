import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { MatCommonModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ExcelPreviewHelper } from '../../Service/excel-preview.helper';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DepreciationScheduleService } from '../../Service/depreciation-schedule.service';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule,MatButtonModule, MatDialogActions,
    MatDialogContent,
    MatCommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule],
})
export class UploadDialogComponent {

  selectedFile: File | null = null;

  userId: any = 0;

  asset2: any[] = [];

  assetCategory: any[] = [];

  assetTypes: any[] = [];

  departments: any[] = [];

  validationFlags: { departmentError: boolean; factionError: boolean }[] = [];

  public data = inject(MAT_DIALOG_DATA);  // ✅ inject data แบบใหม่

  private dialogRef = inject(MatDialogRef<UploadDialogComponent>);

  private ap = inject(ApiService);

  private depreciationScheduleService = inject(DepreciationScheduleService)

  ngOnInit() {
    this.assetCategory = this.data.assetCategory || []; // ✅ ดึงค่าจาก data ที่ inject มา
    this.assetTypes = this.data.assetTypes || [];
    this.departments = this.data.departments || [];
    this.userId = this.data.userId || 0;
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
  
    if (file) {
      ExcelPreviewHelper.parseExcel(file)
        .then(async (rows) => {
          const result = ExcelPreviewHelper.validateDataAgainstMaster(rows, this.departments, this.assetCategory, this.userId);
          this.asset2 = result.data.map(row => this.normalizeAsset(ExcelPreviewHelper.translateToEnglish(row)));
          this.validationFlags = result.validationFlags;
  
          // 👉 วน loop แต่ละ row เพื่อคำนวณค่าเสื่อมแบบแยกประเภท
          const updatedAssets = await Promise.all(this.asset2.map(async (asset) => {
            if (!asset.TypeId) return asset;
  
            try {
              const deps: any = await firstValueFrom(this.ap.assetService.fetchDataById('Depreciations/type', asset.TypeId));
              const schedule = this.depreciationScheduleService.calculateSchedule(asset.PurchasePrice, deps[0].Rate_dep, asset.ReceiptDate);
              const summary = this.depreciationScheduleService.extractFirstYearSummary(schedule);
  
              return {
                ...asset,
                DepreciationRate: deps[0].Rate_dep,
                AssetAge: deps[0].Servicelife,
                DepreciationValue: summary.depreciation,
                AccumulatedDepreciation: summary.accumulatedDepreciation,
                BookValue: summary.bookValue
              };
            } catch (e) {
              console.error(`❌ Error fetching Depreciation for TypeId: ${asset.TypeId}`, e);
              throw e;
            }
          }));
  
          this.asset2 = updatedAssets;
        })
        .catch(() => {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์',
            icon: 'error',
          });
        });
    }
  }
  
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
  
    if (!this.validateUniqueAssetCodes(this.asset2)) return;
    for (const asset of this.asset2) {
      if (!this.validateAsset(asset)) return;
    }
  
    const sanitizedAssets = this.asset2.map(row => ({
      AssetId: 0, // ✅ สำหรับ backend ที่ต้องการ AssetId เสมอ
      AssetCode: row.AssetCode,
      AssetName: row.AssetName,
      PurchasePrice: Number(row.PurchasePrice),
      PurchaseDate: row.PurchaseDate,
      CategoryId: row.CategoryId,
      TypeId: row.TypeId,
      DepartmentId: row.DeptId,
      FactionId: row.FactionId,
      ResponsibleEmployee: row.ResponsibleEmployee,
      Unit: row.Unit,
      Note: row.Note,
      StatusId: 4,
      CreatedBy: row.CreatedBy,
      SubAssets: row.SubAssets || [],
      ReceiptDate: row.ReceiptDate,
      DepreciationRate: row.DepreciationRate,
      AssetAge: row.AssetAge,
      DepreciationValue: row.DepreciationValue,
      AccumulatedDepreciation: row.AccumulatedDepreciation,
      BookValue: row.BookValue
    }));
  
    try {
      console.log('🚀 sanitizedAssets', sanitizedAssets);
      await this.ap.assetService.postData('AssetDetails/bulk', sanitizedAssets);
  
      await Swal.fire({
        title: '✅ สำเร็จ',
        text: 'บันทึกข้อมูลครุภัณฑ์เรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
  
      this.dialogRef?.close(); // ✅ ปิด dialog
    } catch (error: any) {
      if (error.status === 409) {
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

    if (typeof asset.Note === 'number') { asset.Note = asset.Note.toString() || ''; }

    if (asset.PurchaseDate && asset.AssetCode && asset.AssetName && asset.PurchasePrice > 0) {
      return true;
    }

    else {
      console.log('Invalid asset:', asset);
      Swal.fire({
        title: 'Invalid Data',
        text: `Asset Code: ${asset.AssetCode} is incomplete or invalid.`,
        icon: 'error',
      });
      return false;
    }
  }

  validateUniqueAssetCodes(assets: any[]): boolean {
    const assetCodeSet = new Set();
    for (const asset of assets) {
      if (assetCodeSet.has(asset.AssetCode)) {
        Swal.fire({
          title: 'Duplicate Data',
          text: `Asset Code: ${asset.AssetCode} is duplicated in the imported file.`,
          icon: 'error',
        });
        return false;
      }
      assetCodeSet.add(asset.AssetCode);
    }
    return true;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private normalizeAsset(asset: any): any {
    // 🔧 เติม 'กกต ' หากไม่มี
    if (asset.AssetCode && !asset.AssetCode.startsWith('กกต')) {
      asset.AssetCode = 'กกต ' + asset.AssetCode.trim();
    }
  
    // 🔧 แปลงวันที่ให้เป็น Date ที่ใช้งานได้ (รองรับทั้งรูปแบบไทยและสากล)
    // const parseDate = (value: any): string | null => {
    //   if (!value) return null;
    
    //   if (typeof value === 'string') {
    //     // 🔹 กรณี dd/MM/yyyy
    //     if (value.includes('/')) {
    //       const [day, month, year] = value.split('/');
    //       let y = parseInt(year);
    //       if (y > 2400) y -= 543;
    //       const d = parseInt(day);
    //       const m = parseInt(month) - 1;
    //       return new Date(Date.UTC(y, m, d)).toISOString();
    //     }
    
    //     // 🔹 กรณี 10 มี.ค. 2568
    //     const thaiMonths: { [key: string]: number } = {
    //       'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5,
    //       'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11
    //     };
    //     const parts = value.trim().split(' ');
    //     if (parts.length === 3) {
    //       const day = parseInt(parts[0]);
    //       const month = thaiMonths[parts[1]];
    //       let year = parseInt(parts[2]);
    //       if (year > 2400) year -= 543;
    //       return new Date(Date.UTC(year, month, day)).toISOString();
    //     }
    //   }
    
    //   return null;
    // };
    
  
    // asset.PurchaseDate = parseDate(asset.PurchaseDate);
    // asset.ReceiptDate = parseDate(asset.ReceiptDate);
  
    return asset;
  }
  
}
