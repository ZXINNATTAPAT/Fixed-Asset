import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';

import { Router } from '@angular/router';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableModule, UtilitiesModule } from '@coreui/angular';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';


interface AssetDetails {
  assetCode: string,
  assetName: string
}

@Component({
  selector: 'app-defaultdata',
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
    MatButtonModule, // Example: Add any other required Angular Material modules here
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,FormDirective, FormLabelDirective, FormControlDirective,
  ],
  
  templateUrl: './defaultdata.component.html',
  styleUrl: './defaultdata.component.scss'
})

export class DefaultdataComponent implements OnInit {
  
yourFormName: FormGroup<any> | undefined;

onSubmit() {
  throw new Error('Method not implemented.');
}

  icons = { cilPencil, cilTrash };
  assetDetails: AssetDetails[] = [];

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private router: Router) { }

  displayedColumns2: string[] = [
    "รหัสประเภทสินทรัพย์",
    "ชื่อประเภทสินทรัพย์"
  ];

  assetDetailsset: any[] = []

  getAssetType(): void {
    this.http.get<any[]>('https://localhost:7204/api/Assettypecodes').subscribe(data => {
      this.assetDetails = data.map(asset => {
        asset = this.translateToThai(asset); // ฟังก์ชันที่แปลงข้อมูลเป็นภาษาไทย
        return asset;
      });
      // console.log(this.assetDetails);
      this.assetDetailsset = this.assetDetails;
      this.dataSource = new MatTableDataSource<any>(this.assetDetailsset);
      // console.log(this.dataSource)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnInit(): void {
    this.getAssetType();
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "assetCode": "รหัสประเภทสินทรัพย์",
      "assetName": "ชื่อประเภทสินทรัพย์"
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  deleteAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }
  editAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }

}
