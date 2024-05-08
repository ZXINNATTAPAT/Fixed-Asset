import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, InputGroupComponent, BorderDirective } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../../../api-service.service';


import Swal from 'sweetalert2'

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput } from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

// import 'moment/locale/th';
// import 'date-fns/locale/th';
import 'moment/locale/th.js';

import { IconDirective } from '@coreui/icons-angular';
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash } from '@coreui/icons';
import { Subscription } from 'rxjs';


interface AssetDetails1 {
  Date: string;
  SerialNumber: string;
  DepartmentCode: string;
  LocationCode: string;
  Inspector: string;
  Verifier: string;
  Note:string;
  AssetId:string;
  AssetName:string;
  BookValue:string;
  InventoryValue:string;
}

interface AssetDetails {
  assetId: any;
  purchaseDate: string;
  assetCode: string;
  assetName: string;
  purchasePrice: number;
  purchasedFrom: string;
  documentNumber: string;
  department: string;
  responsibleEmployee: string;
  Note: string;
  [key: string]: string | number ; // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
}

@Component({
  selector: 'app-assetcount',
  standalone: true,
  imports:[
    TextColorDirective,

    MatNativeDateModule, MatTabsModule, MatDatepicker, MatDatepickerToggle, MatFormField,
    MatLabel, MatDatepickerInput, MatFormFieldModule, MatInputModule,

    CommonModule,BorderDirective,

    CardComponent, CardHeaderComponent, CardBodyComponent, CardComponent,
    CardHeaderComponent, CardBodyComponent, InputGroupComponent,

    RowComponent, ColComponent,
    TextColorDirective,

    MatTableModule,MatPaginator,MatSort,MatPaginatorModule,

    ReactiveFormsModule,
    FormsModule, FormDirective, FormLabelDirective, FormControlDirective,
  
    ButtonDirective, NgStyle, IconDirective],
  templateUrl: './assetcount.component.html',
  styleUrl: './assetcount.component.scss'
})

export class AssetcountComponent implements OnInit{

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  displayedColumns2: string[] = [
    "การดำเนินการ",
    "วันเดือนปี",
    "รหัสครุภัณฑ์",
    "รายการ",
    "ราคาต่อหน่วย",
    "วิธีการได้มา",
    "เลขที่เอกสาร",
    "แผนก",
    "ผู้ใช้งาน",
    "หมายเหตุ"];

  displayedColumns: string[] = [
    "purchaseDate",
    "assetCode",
    "assetName",
    "purchasePrice",
    "purchasedFrom",
    "documentNumber",
    "department",
    "responsibleEmployee",
    "note"];
  
  displayedColumns3: string[] = ["รหัสครุภัณฑ์","รายการ","ยอดตามบัญชี","ยอดตรวจนับ","ผลต่าง","หมายเหตุ"];

  private dataSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  editAsset(_t115: any) {
    throw new Error('Method not implemented.');
  }

  deleteAsset(_t115: any) {
    throw new Error('Method not implemented.');
  }

  

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "purchaseDate": "วันเดือนปี",
      "assetCode": "รหัสครุภัณฑ์",
      "assetName": "รายการ",
      "purchasePrice": "ราคาต่อหน่วย",
      "purchasedFrom": "วิธีการได้มา",
      "documentNumber": "เลขที่เอกสาร",
      "department": "แผนก",
      "responsibleEmployee": "ผู้ใช้งาน",
      "note": "หมายเหตุ"
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }
  
  assetData:any =[]

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetData);

  dataSource2: any[] = [];

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private formBuilder: FormBuilder) 
    {
      this.getAssetDetails();

  }
  // assetDetails: AssetDetails[] = [];
  assetForm: FormGroup = new FormGroup({});
  form: FormGroup = new FormGroup({});

  getAssetDetails(): void {
    this.dataSubscription = this.apiService.fetchData('assetDetails').subscribe(data => {
      this.assetData = data.map((asset: { purchaseDate: string; }) => {
        asset.purchaseDate = this.convertDate(asset.purchaseDate);
        asset = this.translateToThai(asset);
        return asset;
      });
      // Update the data source with the new asset details
      this.dataSource.data = this.assetData;
    });
  }

  ngOnInit(): void {
    this.getAssetDetails();
    this.assetForm = this.formBuilder.group({
      date: [''],
      serialNumber: [''],//เลขที่เอกสาร
      departmentCode: [''],
      locationCode: [''],
      inspector: [''],
      verifier: [''],
      note: [''],
      assetId: [''],
      assetName: [''],
      bookValue: [''],
      inventoryValue: [''],
    });
    this.form = this.formBuilder.group({
      'รหัสครุภัณฑ์': ['', Validators.required],
      'รายการ': ['', Validators.required],
      'ยอดตามบัญชี': ['', Validators.required],
      'ยอดตรวจนับ': ['', Validators.required],
      'ผลต่าง': ['', Validators.required],
      'หมายเหตุ': ['']
    });
   
  }
  
  onSubmit() {
    if (this.form.valid) {
      this.dataSource2.push(this.form.value); // เพิ่มข้อมูลลงในตาราง
    }
    console.log(this.form.value);
      // const formData = this.form.value;
      // const formData2 = this.assetForm.value;
      // const requestBody = {
      //   inventoryId: 0,
      //   date: new Date().toISOString(), // กำหนดวันที่เป็น ISO string
      //   serialNumber: formData2['serialNumber'],
      //   departmentCode: formData2['departmentCode'],
      //   locationCode: formData2['locationCode'],
      //   inspector: formData2['inspector'],
      //   verifier: formData2['verifier'],
      //   note: formData['หมายเหตุ'],
      //   assetId: formData['assetId'],
      //   assetName: formData['assetName'],
      //   bookValue: formData['bookValue'],
      //   inventoryValue: formData['inventoryValue']
      // };
  
      // // เรียกใช้งาน API โดยใช้ HttpClient
      // this.http.post('https://localhost:7204/api/AssetInventory', requestBody).subscribe(
      //   (response) => {
      //     console.log('ส่งข้อมูลเรียบร้อยแล้ว:', response);
      //     // เพิ่มข้อมูลลงในตารางหรือทำอย่างอื่นตามต้องการ
      //     // this.dataSource2.push(formData);
      //     this.form.reset(); // รีเซ็ตฟอร์มหลังจาก submit
      //   },
      //   (error) => {
      //     console.error('เกิดข้อผิดพลาดในการส่งข้อมูล:', error);
      //   }
      // );
    
  
    
  }

  getSequence(index: number): number {
    return index + 1;
  }

}
