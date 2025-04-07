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

  ngOnInit() {

    // ✅ ดึงค่าจาก data ที่ inject มา
    this.assetCategory = this.data.assetCategory || [];

    this.assetTypes = this.data.assetTypes || [];

    this.departments = this.data.departments || [];

    this.userId = this.data.userId || 0;
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      ExcelPreviewHelper.parseExcel(file)
      .then((rows) => {
        console.log(this.userId);
        const result = ExcelPreviewHelper.validateDataAgainstMaster(rows, this.departments, this.assetCategory, this.userId);

        // ✅ แปลงชื่อ field ภาษาไทย → ภาษาอังกฤษ
        this.asset2 = result.data.map(row => ExcelPreviewHelper.translateToEnglish(row));

        this.validationFlags = result.validationFlags;
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

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.validateUniqueAssetCodes(this.asset2)) return;

    for (const asset of this.asset2) {
      if (!this.validateAsset(asset)) return;
    }

    const sanitizedAssets = this.asset2.map(row => ({
      AssetCode: row.AssetCode,
      AssetName: row.AssetName,
      PurchasePrice: Number(row.PurchasePrice),
      PurchaseDate: row.PurchaseDate,
      CategoryId: row.CategoryId,
      TypeId: row.TypeId,
      DepartmentId: row.DeptId, // ✅ แก้ตรงนี้
      FactionId: row.FactionId,
      ResponsibleEmployee: row.ResponsibleEmployee,
      Unit: row.Unit,
      Note: row.Note,
      StatusId: 4,
      CreatedBy: row.CreatedBy,
      SubAssets: row.SubAssets || [],
    }));
    
    try {
      console.log('sanitizedAssets', sanitizedAssets);
      await this.ap.assetService.postData('AssetDetails/bulk', sanitizedAssets); // ← array ตรงๆ

      await Swal.fire({
        title: '✅ สำเร็จ',
        text: 'บันทึกข้อมูลครุภัณฑ์เรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      this.dialogRef?.close(); // ✅ ปิด dialog หลังจาก alert จบ

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
}
