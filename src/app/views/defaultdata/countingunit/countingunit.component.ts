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
  unitCode: string,
  unitName: string
}

@Component({
  selector: 'app-countingunit',
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
  templateUrl: './countingunit.component.html',
  styleUrl: './countingunit.component.scss'
})
export class CountingunitComponent implements OnInit {

  yourFormName: FormGroup<any> | undefined;

  asset: any = {}; 

  onSubmit() {
    this.http.post<any>('https://localhost:7204/api/Countingunits', this.asset)
        .subscribe(
          response => {
            // console.log(response);
            const newAsset = response;
            // console.log(newAsset);
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
    "รหัสหน่วยนับ",
    "ชื่อหน่วยนับ"
  ];

  assetDetailsset: any[] = []

  getAssetType(): void {
    this.http.get<any[]>('https://localhost:7204/api/Countingunits').subscribe(data => {
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
      "unitCode": "รหัสหน่วยนับ",
      "unitName": "ชื่อหน่วยนับ"
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  deleteAsset(asset: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    }).then((result) => {
  
      if (result.isConfirmed) {
        // ผู้ใช้ยืนยันแล้ว ดำเนินการลบ
        this.http.delete(`https://localhost:7204/api/Factiontypecodes/${asset.id}`).subscribe(
          () => {
            const index = this.assetDetailsset.findIndex(a => a.id === asset.id);
              if (index !== -1) {
                this.assetDetails.splice(index, 1);
                this.dataSource.data = this.assetDetails;
              }
            Swal.fire(
              'ลบแล้ว!',
              'สินทรัพย์ของคุณถูกลบแล้ว',
              'success'
            );
          },
          (error) => {
            console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
            Swal.fire(
              'ข้อผิดพลาด!',
              'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์',
              'error'
            );
          }
        );
        
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // ผู้ใช้ยกเลิก ไม่ต้องกระทำอะไร
        Swal.fire(
          'ยกเลิกแล้ว',
          'สินทรัพย์ของคุณปลอดภัย :)',
          'info'
        );
      }
    });
  }
  editAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }

}

