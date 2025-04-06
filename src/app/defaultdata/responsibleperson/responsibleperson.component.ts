import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
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
  rP_Code: "string",
  rP_Name: "string",
}


@Component({
  selector: 'app-responsibleperson',
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
  templateUrl: './responsibleperson.component.html',
  styleUrl: './responsibleperson.component.scss'
})

export class ResponsiblepersonComponent implements OnInit {

  icons = { cilPencil, cilTrash };
  assetDetails: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(this.assetDetails);

  // Define the asset property to bind form inputs
  asset: any = {
    rP_Code: '',
    rP_Name: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  yourFormName: FormGroup;

  constructor(private http: HttpClient, private formBuilder: FormBuilder ,private ap: ApiService) {
    this.yourFormName = this.formBuilder.group({rP_Code: '',rP_Name: ''});
  }

  displayedColumns2: string[] = [
    "รหัสพนักงาน",
    "ชื่อพนักงาน",
  ];

  ngOnInit(): void {
    this.getAssetType();
  }

  getAssetType(): void {
    this.ap.assetService.fetchData('ResponsiblePersons').subscribe(data => {
      this.assetDetails = data.map((asset: AssetDetails) => this.translateToThai(asset));
      this.dataSource = new MatTableDataSource<any>(this.assetDetails);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "rP_Code": "รหัสพนักงาน",
      "rP_Name": "ชื่อพนักงาน"
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  onSubmit(): void {
    const formData = this.yourFormName.value;
    this.ap.assetService.postData('ResponsiblePersons', formData).then(
      response => {
        const newAsset = this.translateToThai(response);
        this.assetDetails.push(newAsset);
        this.dataSource.data = this.assetDetails;

        Swal.fire({
          title: "บันทึกเสร็จสิ้น",
          icon: "success"
        });
      }
    ).catch(
      error => {
        console.error('Error:', error);
        Swal.fire({
          title: "เกิดข้อผิดพลาดในการบันทึก",
          icon: "error"
        });
      }
    );
  }

  deleteAsset(asset: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบข้อมูลพนักงานนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ap.assetService.fetchData(`ResponsiblePersons/${asset.id}`).subscribe(
          () => {
            const index = this.assetDetails.findIndex(a => a.id === asset.id);
            if (index !== -1) {
              this.assetDetails.splice(index, 1);
              this.dataSource.data = this.assetDetails;
            }
            Swal.fire('ลบแล้ว!', 'ข้อมูลพนักงานของคุณถูกลบแล้ว', 'success');
          },
          (error) => {
            console.error('เกิดข้อผิดพลาดในการลบข้อมูลพนักงาน:', error);
            Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบข้อมูลพนักงาน', 'error');
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('ยกเลิกแล้ว', 'ข้อมูลพนักงานของคุณปลอดภัย :)', 'info');
      }
    });
  }

  editAsset(asset: any): void {
    Swal.fire('ยังไม่ได้พัฒนา', 'ฟังก์ชันแก้ไขอยู่ระหว่างการพัฒนา', 'info');
  }

}
