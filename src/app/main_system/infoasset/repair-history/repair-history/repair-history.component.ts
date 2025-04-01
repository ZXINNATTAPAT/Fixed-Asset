import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../../../../ApiController/api-service.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface RepairAsset {
  RepairAssetId: number;
  AssetId: number;
  AssetCode: string;
  AssetName: string;
  Date: string;
  SerialNumber: string;
  Description: string;
  Amount: number;
}

@Component({
  selector: 'app-repair-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repair-history.component.html',
  styleUrl: './repair-history.component.scss'
})
export class RepairAssetComponent implements OnInit {
  data: RepairAsset[] = [];
  assetId!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public datadialog: any,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // ใช้ AssetId จาก datadialog ถ้ามี
    if (this.datadialog?.id) {
      this.assetId = this.datadialog.id;
      this.loadRepairAssets(this.assetId);
    } else {
      console.warn('AssetId not found in dialog data');
    }
  }

  loadRepairAssets(assetId: number): void {
    this.apiService.fetchDatahttp(`RepairAsset?assetId=${assetId}`).subscribe({
      next: (res) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching repair assets:', err);
      }
    });
  }
}
