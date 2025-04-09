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
import { ApiService } from '../../../ApiController/apiservice/api-service.service';

interface AssetDetails {
  sellerCode: "string",
  sellerName: "string",
  address: "string",
  tel: "string",
  telfax: "string",
  email: "string",
  homepage: "string",
  tinNumber: "string"
}

@Component({
  selector: 'app-property-seller',
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
    IconDirective, FormDirective, FormLabelDirective, FormControlDirective,
  ],
  templateUrl: './property-seller.component.html',
  styleUrl: './property-seller.component.scss'
})

export class PropertySellerComponent implements OnInit {

  yourFormName: FormGroup<any> | undefined;
  isFormVisible = false; // เริ่มต้นซ่อนฟอร์ม
  asset: any = {};
  icons = { cilPencil, cilTrash };
  assetDetails: AssetDetails[] = [];

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router, private ap: ApiService) { }

  onSubmit() {
    this.ap.assetService.postData('PropertySellers', this.asset)
      .then(response => {
        // console.log(response);
        const newAsset = response;
        // console.log(newAsset);
        this.assetDetails.push(this.translateToThai(newAsset));
        this.dataSource.data = this.assetDetails;

        Swal.fire({
          title: "บันทึกเสร็จสิ้น",
          icon: "success"
        });
      })
      .catch(error => {
        console.error(error);
        if (error) {
          Swal.fire({
            title: "มีข้อมูลในระบบอยู่แล้ว",
            icon: "error"
          });
        }
      });
  }
  
  displayedColumns2: string[] = [
    "รหัสผู้ขาย",
    "ชื่อผู้ขาย",
    "ที่อยู่",
    "เบอร์โทรศัพท์",
    "เบอร์แฟ็กซ์",
    "อีเมล",
    "เว็บไซต์",
    "หมายเลขประจำตัวผู้เสียภาษี"
  ];

  assetDetailsset: any[] = []

  getAssetType(): void {
    this.ap.assetService.fetchData('PropertySellers').subscribe(data => {
      this.assetDetails = data.map((asset: Record<string, any>): AssetDetails => {
        asset = this.translateToThai(asset); // ฟังก์ชันที่แปลงข้อมูลเป็นภาษาไทย
        return asset as AssetDetails;
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
      "SellerCode": "รหัสผู้ขาย",
      "SellerName": "ชื่อผู้ขาย",
      "Address": "ที่อยู่",
      "Tel": "เบอร์โทรศัพท์",
      "Telfax": "เบอร์แฟ็กซ์",
      "Email": "อีเมล",
      "Homepage": "เว็บไซต์",
      "TinNumber": "หมายเลขประจำตัวผู้เสียภาษี",
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