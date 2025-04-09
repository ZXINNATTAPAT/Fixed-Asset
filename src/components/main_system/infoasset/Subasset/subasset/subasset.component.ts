import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { IconDirective } from '@coreui/icons-angular';
import { cilPencil } from '@coreui/icons';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { CommonModule } from '@angular/common';

export interface SubAsset {
  SubAssetId: number;
  AssetId: number;
  SubAssetCode: string;
  SubAssetName: string;
  Unit: string;
  AssetLocation: string;
  ResponsibleEmployee: string;
  Status: string;
  Note: string;
}

@Component({
  selector: 'app-subasset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subasset.component.html',
  styleUrl: './subasset.component.scss'
})
export class SubAssetDialogComponent implements OnInit {

  data: SubAsset[] = [];
  assetId!: number;

  constructor(
    private subAssetService: ApiService,
    @Inject(MAT_DIALOG_DATA) public datadialog: any
  ) {}

  ngOnInit(): void {
    const assetId = this.datadialog?.id;
    if (assetId) {
      this.loadSubAssets(assetId);
    } else {
      console.warn('ไม่พบค่า AssetId ใน dialog data');
    }
  }

  loadSubAssets(assetId: number): void {
    this.subAssetService.assetService.fetchData(`SubAssets?assetId=${assetId}`).subscribe({
      next: (res) => {
        this.data = res;
        console.log('SubAssets loaded:', res);
      },
      error: (err) => {
        console.error('Error loading SubAssets:', err);
      }
    });
  }
}
