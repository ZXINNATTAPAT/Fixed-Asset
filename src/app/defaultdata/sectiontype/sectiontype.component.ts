import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatPaginator ,MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';

import { Router } from '@angular/router';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableModule, UtilitiesModule } from '@coreui/angular';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';

interface AssetDetails {
  sectioncode: string,
  sectionName: string
}
@Component({
  selector: 'app-sectiontype',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective, FormDirective, FormLabelDirective, FormControlDirective,
  ],
  templateUrl: './sectiontype.component.html',
  styleUrl: './sectiontype.component.scss'
})
export class SectiontypeComponent {
  icons = { cilPencil, cilTrash };

  assetDetails: AssetDetails[] = [];

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  isFormVisible = false; // เริ่มต้นซ่อนฟอร์ม

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private router: Router) { }

  displayedColumns2: string[] = ["รหัสแผนก", "ชื่อแผนก"];
  assetDetailsset: any[] = [];

  ngOnInit(): void { this.getAssetType(); }

  getAssetType(): void {
    this.http.get<any[]>('https://localhost:7204/api/Departments', { withCredentials: true }).subscribe(data => {
      this.assetDetails = data.map(asset => {
        asset = this.translateToThai(asset);
        return asset;
      });
      this.assetDetailsset = this.assetDetails;
      this.dataSource = new MatTableDataSource<any>(this.assetDetailsset);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "Code": "รหัสแผนก",
      "Name": "ชื่อแผนก"
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  postAssetType(sectionCode: string, sectionName: string): void {
    const newAssetType = {
      sectionCode,
      sectionName
    };
    this.http.post('https://localhost:7204/api/SectionTypeCodes', newAssetType, { withCredentials: true }).subscribe(
      response => {
        console.log('Asset Type created:', response);
        this.getAssetType(); // Refresh data after post
      },
      error => {
        console.error('Error creating Asset Type:', error);
      }
    );
  }

  deleteAsset(_t27: any) {
    throw new Error('Method not implemented.');
  }
  editAsset(_t27: any) {
    throw new Error('Method not implemented.');
  }
}

