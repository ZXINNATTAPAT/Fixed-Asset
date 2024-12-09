import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ExcelService } from '../../Service/excel.service';
import { ApiService } from '../../../../ApiController/api-service.service';
import { MatCommonModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule,MatDialogActions,MatDialogContent,MatCommonModule,MatButtonModule,CommonModule], // Required Material modules
  providers: [
    { provide: MatDialogRef, useValue: { close: () => {} } }, // Add MatDialogRef provider for standalone use
  ],
})
export class UploadDialogComponent {
  selectedFile: File | null = null;
  asset2: any[] = [];
  assetCategory: any[] = [];
  assetTypes: any[] = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<UploadDialogComponent>,
    private excelService: ExcelService,
    private ap: ApiService
  ) {}

  onFileChange(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.excelService
        .importExcel(file, this.assetCategory, this.assetTypes)
        .then((data) => {
          this.asset2 = data;
          console.log('Imported data:', data);
        })
        .catch((error) => {
          console.error('Error importing Excel:', error);
          Swal.fire({
            title: 'Error importing Excel',
            text: 'Please check your file and try again.',
            icon: 'error',
          });
        });
    } else {
      console.warn('No file selected');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.validateUniqueAssetCodes(this.asset2)) {
      return;
    }

    for (const asset of this.asset2) {
      if (!this.validateAsset(asset)) {
        return;
      }
    }

    const batchSize = 25;
    for (let i = 0; i < this.asset2.length; i += batchSize) {
      const batch = this.asset2.slice(i, i + batchSize);
      await Promise.all(batch.map((asset) => this.sendRequest(asset)));
    }

    if (this.dialogRef) {
      this.dialogRef.close(); // Close the dialog after processing
    }
  }

  private async sendRequest(asset: any): Promise<void> {
    try {
      console.log('Sending asset data:', asset);
      const response = await firstValueFrom(await this.ap.postData('AssetDetails', asset));
      console.log('Response:', response);
      Swal.fire({
        title: 'Success',
        text: 'Data has been saved successfully.',
        icon: 'success',
      });
    } catch (error: any) {
      console.error('Error while sending request:', error);
      Swal.fire({
        title: 'Error',
        text: `Failed to save data. Error: ${error.message || 'Unknown error'}`,
        icon: 'error',
      });
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
