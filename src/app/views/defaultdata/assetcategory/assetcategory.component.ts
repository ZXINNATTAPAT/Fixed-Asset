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
import Swal from 'sweetalert2';

interface AssetDetails {
  asc_Code: "string",
  asc_Name: "string",
  assetCode: "string"
}

@Component({
  selector: 'app-assetcategory',
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
  templateUrl: './assetcategory.component.html',
  styleUrl: './assetcategory.component.scss'
})
export class AssetcategoryComponent implements OnInit {

  yourFormName: FormGroup<any> | undefined;
  asset: any = {};

  onSubmit() {
    this.http.post<any>('https://localhost:7204/api/Assetcategories', this.asset)
        .subscribe(
          response => {
            console.log(response);
            const newAsset = response;
            console.log(newAsset);
            this.assetDetails.push(this.translateToThai(newAsset));
            this.dataSource.data = this.assetDetails;
  
            Swal.fire({
              title: "บันทึกเสร็จสิ้น",
              icon: "success"
            });
          },
          error => {
            console.error(error);
            if (error) {
              Swal.fire({
                title: "มีข้อมูลในระบบอยู่แล้ว",
                icon: "error"
              });
            }
          }
        );
  }

  icons = { cilPencil, cilTrash };
  assetDetails: AssetDetails[] = [];

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private router: Router) { }

  displayedColumns2: string[] = [
    "รหัสหมวดสินทรัพย์",
    "ชื่อหมวดสินทรัพย์",
    "รหัสประเภทสินทรัพย์"
  ];

  assetDetailsset: any[] = []

  getAssetType(): void {
    this.http.get<any[]>('https://localhost:7204/api/Assetcategories').subscribe(data => {
      this.assetDetails = data.map(asset => {
        asset = this.translateToThai(asset); // ฟังก์ชันที่แปลงข้อมูลเป็นภาษาไทย
        return asset;
      });
      console.log(this.assetDetails);
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
      "asc_Code": "รหัสหมวดสินทรัพย์",
      "asc_Name": "ชื่อหมวดสินทรัพย์",
      "assetCode": "รหัสประเภทสินทรัพย์"
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
