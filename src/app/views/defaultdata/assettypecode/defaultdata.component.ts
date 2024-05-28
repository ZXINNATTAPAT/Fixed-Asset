import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  UtilitiesModule,
} from '@coreui/angular';
import {
  RowComponent,
  ColComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/api-service.service';

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
  constructor(private http: HttpClient, private apiService: ApiService) {}

  yourFormName: FormGroup<any> | undefined;

  asset: any = {};

  async onSubmit() {
    try {
      const response = await this.apiService.postData(
        'Assettypecodes/',
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

  dataSource: MatTableDataSource<AssetDetails> =
    new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns2: string[] = [
    'รหัสประเภทสินทรัพย์',
    'ชื่อประเภทสินทรัพย์',
    'อัตราค่าเสื่อม',
    'อายุการใช้งาน',
  ];

  assetDetailsset: any[] = [];

  getAssetType(): void {
    this.apiService.fetchDatahttp('Assettypecodes').subscribe((data) => {
      this.assetDetails = data.map((asset: any) => {
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
      assetCode: 'รหัสประเภทสินทรัพย์',
      assetName: 'ชื่อประเภทสินทรัพย์',
      rate_dep: 'อัตราค่าเสื่อม',
      servicelife: 'อายุการใช้งาน',
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
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        // ผู้ใช้ยืนยันแล้ว ดำเนินการลบ
        this.http
          .delete(`https://localhost:7204/api/Assettypecodes/${asset.id}`)
          .subscribe(
            () => {
              const index = this.assetDetailsset.findIndex(
                (a) => a.id === asset.id
              );
              if (index !== -1) {
                this.assetDetails.splice(index, 1);
                this.dataSource.data = this.assetDetails;
              }
              Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
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
        Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณปลอดภัย :)', 'info');
      }
    });
  }
  editAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }
}
