import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  FactionCode: string;
  FactionName: string;
}

@Component({
  selector: 'app-faction-code',
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
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
  ],
  templateUrl: './faction-code.component.html',
  styleUrl: './faction-code.component.scss',
})
export class FactionCodeComponent implements OnInit {
  icons = { cilPencil, cilTrash };
  assetDetails: any[] = []; // Array to hold the faction details data
  isFormVisible = false; // เริ่มต้นซ่อนฟอร์ม

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private ap: ApiService) {}

  displayedColumns2 = ['รหัสฝ่าย', 'ชื่อฝ่าย', 'ชื่อสำนัก']; // <-- เพิ่มชื่อสำนัก
  asset: any = {};

  ngOnInit(): void {
    this.getAssetType();
  }

  getAssetType(): void {
    this.ap.assetService.fetchData('Factiontypecodes').subscribe(
      (data) => {
        this.assetDetails = data.map((asset: any) => this.translateToThai(asset));
        this.dataSource = new MatTableDataSource<any>(this.assetDetails);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Error fetching faction type codes:', error);
      }
    );
  }

  onSubmit(): void {
    this.ap.assetService.postData('Factiontypecodes', this.asset).then(
      (response) => {
        const newAsset = this.translateToThai(response);
        this.assetDetails.push(newAsset);
        this.dataSource.data = this.assetDetails;

        Swal.fire({
          title: 'บันทึกเสร็จสิ้น',
          icon: 'success',
        });
      }
    ).catch(
      (error) => {
        console.error('Error saving faction type code:', error);
        Swal.fire({
          title: 'มีข้อมูลในระบบอยู่แล้ว',
          icon: 'error',
        });
      }
    );
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      Code: 'รหัสฝ่าย',
      Name: 'ชื่อฝ่าย',
      DepartmentName: 'ชื่อสำนัก',
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }

    console.log('Translated Asset:', translatedAsset); // Log translated object for debugging
    return translatedAsset;
  }

  deleteAsset(asset: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบข้อมูลฝ่ายนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ap.assetService.deleteData(`Factiontypecodes/${asset.id}`).then(
          () => {
            const index = this.assetDetails.findIndex((a) => a.id === asset.id);
            if (index !== -1) {
              this.assetDetails.splice(index, 1);
              this.dataSource.data = this.assetDetails;
            }
            Swal.fire('ลบแล้ว!', 'ข้อมูลฝ่ายของคุณถูกลบแล้ว', 'success');
          }
        ).catch(
          (error) => {
            console.error('Error deleting faction type code:', error);
            Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบข้อมูลฝ่าย', 'error');
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('ยกเลิกแล้ว', 'ข้อมูลฝ่ายของคุณปลอดภัย :)', 'info');
      }
    });
  }

  editAsset(asset: any): void {
    Swal.fire('ยังไม่ได้พัฒนา', 'ฟังก์ชันแก้ไขอยู่ระหว่างการพัฒนา', 'info');
  }
}

