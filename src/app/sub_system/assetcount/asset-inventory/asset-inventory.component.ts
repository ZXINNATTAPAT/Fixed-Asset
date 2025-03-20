import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { ApiService, AssetInventoryDetails } from '../../../ApiController/api-service.service';

@Component({
  selector: 'app-asset-inventory',
  standalone:true,
  imports:[CommonModule,NgStyle],
  templateUrl: './asset-inventory.component.html',
  styleUrls: ['./asset-inventory.component.scss']
})
export class AssetInventoryComponent implements OnInit {
  assetInventoryList: AssetInventoryDetails[] = [];
  
  loading: boolean = true;

  constructor(private ap:ApiService) {}

  ngOnInit(): void {
    this.ap.getAssetInventory().subscribe(
      (data) => {
        this.assetInventoryList = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching asset inventory:', error);
        this.loading = false;
      }
    );
  }
}
