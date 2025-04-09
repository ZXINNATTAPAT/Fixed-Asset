import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EditAssetDialogComponent } from './/Dialog/edit-asset-dialog.component';

import { Router } from '@angular/router';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableModule, UtilitiesModule } from '@coreui/angular';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

interface AssetDetails {
  id: "string"
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
    MatDialogModule,
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
  icons = { cilPencil, cilTrash };
  assetDetails: AssetDetails[] = [];
  isFormVisible = false; // เริ่มต้นซ่อนฟอร์ม
  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private ap: ApiService, private router: Router, private dialog: MatDialog) {}
  displayedColumns2: string[] = [
    "รหัสหมวดสินทรัพย์",
    "ชื่อหมวดสินทรัพย์",
    "ชื่อประเภทสินทรัพย์"
  ];

  assetDetailsset: any[] = []

  onSubmit() {
    this.ap.assetService.postData('Assetcategories', this.asset )
        .then(response => {
            console.log(response);
            const newAsset = response;
            console.log(newAsset);
            this.assetDetails.push(this.translateToThai(newAsset));
            this.dataSource.data = this.assetDetails;
  
            Swal.fire({
              title: "บันทึกเสร็จสิ้น",
              icon: "success"
            });
            this.asset = {}
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

  

  getAssetType(): void {
    this.ap.assetService.fetchData('Assetcategories').subscribe(data => {
      this.assetDetails = data.map((asset: any) => {
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

  ngOnInit(): void {this.getAssetType();}
  
  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "CategoryCode": "รหัสหมวดสินทรัพย์",
      "CategoryName": "ชื่อหมวดสินทรัพย์",
      "TypeName": "ชื่อประเภทสินทรัพย์"
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
        this.ap.assetService.deleteData(`Assetcategories/${asset.id}`).then(
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
          }
        ).catch(
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

 
  
  editAsset(asset: AssetDetails): void {
    const dialogRef = this.dialog.open(EditAssetDialogComponent, {
      width: '400px',
      data: { ...asset }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the asset details
        this.ap.assetService.updateData(`Assetcategories/${asset.id}`, result)
          .then(() => {
            const index = this.assetDetails.findIndex(a => a.id === asset.id);
            if (index !== -1) {
              this.assetDetails[index] = { ...asset, ...result };
              this.dataSource.data = this.assetDetails;
            }
            Swal.fire('สำเร็จ', 'ข้อมูลสินทรัพย์ถูกแก้ไขแล้ว', 'success');
          })
          .catch(error => {
            console.error('Error updating asset:', error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
          });
      }
    });
  }

}
