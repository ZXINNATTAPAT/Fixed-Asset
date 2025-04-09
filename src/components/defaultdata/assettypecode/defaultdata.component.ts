import {RowComponent,ColComponent,FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, UtilitiesModule,} from '@coreui/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditAssettypeDialogComponent } from './Dialog/edit-assettype-dialog.component';

interface AssetDetails {
  assetCode: string;
  assetName: string;
  rate_dep: string;
  servicelife: string;
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
    MatDialogModule,
    
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule, // Example: Add any other required Angular Material modules here
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
  ],
  templateUrl: './defaultdata.component.html',
  styleUrl: './defaultdata.component.scss',
})
export class DefaultdataComponent implements OnInit {
  constructor(private apiService: ApiService,private dialog :MatDialog) { }

  yourFormName: FormGroup<any> | undefined;
  isFormVisible = false; // เริ่มต้นซ่อนฟอร์ม
  asset: any = {};

  async onSubmit() {
    try {
      const response = await this.apiService.assetService.postData(
        'Assettype/',
        this.asset
      );
      const newAsset = response;
      this.assetDetails.push(this.translateToThai(newAsset));
      this.dataSource.data = this.assetDetails;

      Swal.fire({
        title: 'บันทึกเสร็จสิ้น',
        icon: 'success',
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'มีข้อมูลในระบบอยู่แล้ว',
        icon: 'error',
      });
    }
  }

  icons = { cilPencil, cilTrash };
  assetDetails: AssetDetails[] = [];
  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns2: string[] = ['รหัสประเภทสินทรัพย์', 'ชื่อประเภทสินทรัพย์', 'อัตราค่าเสื่อม(%)', 'อายุการใช้งาน',];
  assetDetailsset: any[] = [];

  getAssetType(): void {
    this.apiService.assetService.fetchData('Assettype').subscribe((data) => {
      this.assetDetails = data.map((asset: any) => this.translateToThai(asset)); // Apply translation
      this.assetDetailsset = [...this.assetDetails]; // Clone the array for immutability
      this.dataSource = new MatTableDataSource<any>(this.assetDetailsset);

      // Ensure paginator and sort exist before assigning them
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;
    });
  }

  ngOnInit(): void {
    this.getAssetType();
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      TypeCode: 'รหัสประเภทสินทรัพย์',
      TypeName: 'ชื่อประเภทสินทรัพย์',
    };

    // Clone object for immutability
    let translatedAsset: any = { ...asset };

    for (const key in asset) {
      if (!asset.hasOwnProperty(key)) continue;

      if (translationMap[key]) {
        translatedAsset[translationMap[key]] = asset[key];
        delete translatedAsset[key]; // Remove old key
      }

      // Handle Depreciations separately - Extract first depreciation entry
      if (key === 'Depreciations' && Array.isArray(asset[key]) && asset[key].length > 0) {
        const depreciation = asset[key][0]; // Take the first entry (if exists)
        translatedAsset['อัตราค่าเสื่อม(%)'] = depreciation.Rate_dep ?? '-';
        translatedAsset['อายุการใช้งาน'] = depreciation.Servicelife ?? '-';
        delete translatedAsset[key]; // Remove original array
      } else if (key === 'Depreciations') {
        // If no depreciation data, set empty values
        translatedAsset['อัตราค่าเสื่อม(%)'] = '-';
        translatedAsset['อายุการใช้งาน'] = '-';
        delete translatedAsset[key];
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
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        // ผู้ใช้ยืนยันแล้ว ดำเนินการลบ
        this.apiService.assetService.deleteData(`Assettype/${asset.TypeId}`)
          .then(() => {
            const index = this.assetDetailsset.findIndex(
              (a) => a.TypeId === asset.TypeId
            );
            if (index !== -1) {
              this.assetDetails.splice(index, 1);
              this.dataSource.data = this.assetDetails;
            }
            Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
          })
          .catch((error) => {
            console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
            Swal.fire(
              'ข้อผิดพลาด!',
              'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์',
              'error'
            );
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // ผู้ใช้ยกเลิก ไม่ต้องกระทำอะไร
        Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณปลอดภัย :)', 'info');
      }
    });
  }
  editAsset(asset: any): void {
    const dialogRef = this.dialog.open(EditAssettypeDialogComponent, {
      width: '400px',
      data: asset
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // เรียก API PUT หรือ PATCH
        this.apiService.assetService.updateData(`Assettype/${result.TypeId}`, result)
          .then(() => {
            Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว', 'success');
            this.getAssetType(); // refresh data
          })
          .catch(() => {
            Swal.fire('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
          });
      }
    });
  }
  

}
