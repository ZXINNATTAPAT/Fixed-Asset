import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';

import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableModule, UtilitiesModule } from '@coreui/angular';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

interface AssetDetails {
  repairAssetId: any;
  assetcode: string;
  assetId: string;
  SerialNumber: string;
  Description: string;
  Amount: string;
}

@Component({
  selector: 'app-repair',
  standalone: true,
  imports: [CardComponent,
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
    IconDirective,FormDirective, FormLabelDirective, FormControlDirective,],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss'
})

export class RepairComponent implements OnInit {

  assetCode: string =""; //for input
  
  constructor(private http: HttpClient) { }

  assetDetails: AssetDetails[] = [];

  assetDetails2: any[] = [];
  
  assetDetailsset: any[] = [];

  assettablecode:any[] = [];

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  asset: any ={assetId: ''};

  icons = { cilPencil, cilTrash ,cilMagnifyingGlass};

  displayedColumns2: string[] = ["รหัสครุภัณฑ์","เลขที่เอกสาร","รายละเอียด","จำนวนเงิน",];
  
  ngOnInit(): void {
    this.getAssetdata();
    this.getAssetType();
  }

  onSubmit() {
    this.http.post<any>('https://localhost:7204/api/RepairAsset', this.asset)
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

  getAssetType(): void {
    this.http.get<any[]>('https://localhost:7204/api/RepairAsset').subscribe(data => {
      this.assetDetails = data.map(asset => {
        const foundAsset = this.assetDetails2.find(asset2 => asset2.assetId === asset.assetId);
        if (foundAsset) {
          asset.assetCode = foundAsset.assetCode; // เพิ่ม property assetCode เข้าไปในข้อมูล asset
        } else {
          console.log('Asset code not found for assetId:', asset.assetId);
        }
        asset = this.translateToThai(asset); // แปลงข้อมูลเป็นภาษาไทย
        return asset;
      });
  
      // console.log(this.assetDetails);
      
      this.assetDetailsset = this.assetDetails;
  
      this.dataSource = new MatTableDataSource<any>(this.assetDetailsset);
  
      // console.log(this.assetDetailsset);
  
      this.dataSource.paginator = this.paginator;
  
      this.dataSource.sort = this.sort;
    });
  }

  getAssetdata(): void {
    this.http.get<any[]>('https://localhost:7204/api/AssetDetails').subscribe(data => {
        this.assetDetails2 = data.map(asset => {
            return {
                assetId: asset.assetId,
                assetCode: asset.assetCode,
                assetName: asset.assetName
            };
        });
        console.log(this.assetDetails2);
    });
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "assetId": "assetId",
      "assetCode":"รหัสครุภัณฑ์",
      "serialNumber": "เลขที่เอกสาร",
      "description": "รายละเอียด",
      "amount": "จำนวนเงิน",
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  onSearch(): void {
    const foundAsset = this.assetDetails2.find((asset: { assetCode: string; }) => asset.assetCode === this.assetCode);
    if (foundAsset) {
      this.asset.assetId = foundAsset.assetId; // กำหนดค่า assetId ให้กับตัวแปร asset
      Swal.fire({
        title: 'ตรวจพบสินทรัพย์',
        icon: 'warning',
      });
    } else {
      Swal.fire({
        title: 'ไม่พบสินทรัพย์',
        icon: 'error',
      });
      // console.log(this.asset)
      // console.log('Asset not found');
    }
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
        this.http.delete(`https://localhost:7204/api/RepairAsset/${asset.repairAssetId}`).subscribe(
          () => {
            const index = this.assetDetails.findIndex(a => a.repairAssetId === asset.repairAssetId);
              if (index !== -1) {
                this.assetDetails.splice(index, 1);
                // Update the data source after deletion
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
