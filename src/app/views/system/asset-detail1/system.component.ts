import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, InputGroupComponent } from '@coreui/angular';
import { NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { AssetDetails2Component } from '../asset-details2/asset-details2.component'
import Swal from 'sweetalert2'
import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput } from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MomentDateModule, provideMomentDateAdapter } from '@angular/material-moment-adapter';
// import 'moment/locale/th';
// import 'date-fns/locale/th';
import 'moment/locale/th.js';
// import moment from 'moment';



@Component({
  selector: 'app-form-controls',
  templateUrl: 'system.component.html',
  standalone: true,
  providers: [
    // { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
    // { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true} },

    // { provide: DateAdapter, useClass: BuddhistDateAdapter },
    // { provide: MAT_DATE_FORMATS, useValue: BUDDHIST_DATE_FORMATS },

    // กำหนด Locale เป็น พ.ศ.
    { provide: MAT_DATE_LOCALE, useValue: 'th' },
    // กำหนดให้ใช้ MomentDateAdapter สำหรับแสดงวันที่
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    // กำหนด Date Formats ให้เป็นรูปแบบที่เป็น พ.ศ.
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY',
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      }
    },
    provideMomentDateAdapter(
      {
        parse: {
          dateInput: ['l', 'LL'],
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      }), // Provide options for the date adapter
  ],
  imports: [
    AssetDetails2Component, AssetDetails3Component,
    TextColorDirective,

    MomentDateModule,

    MatNativeDateModule, MatTabsModule, MatDatepicker, MatDatepickerToggle, MatFormField,
    MatLabel, MatDatepickerInput, MatFormFieldModule, MatInputModule,


    CardComponent, CardHeaderComponent, CardBodyComponent, CardComponent,
    CardHeaderComponent, CardBodyComponent, InputGroupComponent,

    RowComponent, ColComponent,
    TextColorDirective,

    ReactiveFormsModule,
    FormsModule, FormDirective, FormLabelDirective, FormControlDirective,
    ButtonDirective, NgStyle]

})
export class SystemComponent implements OnInit {

  hidden: boolean = true;

  toggleHidden(): void {
    this.hidden = !this.hidden; // เมื่อคลิกปุ่มจะเปลี่ยนค่า hidden เป็นค่าตรงกันข้าม
  }

  autoInput(event: KeyboardEvent) {
    const assetCodeInput = document.getElementById('assetCodeInput') as HTMLInputElement;
    if (event.target === assetCodeInput) {
      // เมื่อผู้ใช้พิมพ์บน input assetCodeInput
      const currentValue = assetCodeInput.value;
      if (!currentValue.startsWith('กกต')) {
        // ถ้าข้อมูลที่ป้อนไม่ได้เริ่มด้วย 'กกต.นศ'
        assetCodeInput.value = 'กกต ' + currentValue;
      }
    }
  }

  handleKeyPress(event: KeyboardEvent, nextInputId: string) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  asset: any = {}; // สร้าง object เพื่อเก็บข้อมูลสินทรัพย์ที่ผู้ใช้ป้อน

  ngOnInit(): void { }

  constructor(private http: HttpClient, private dateAdapter: DateAdapter<MomentDateAdapter>) {
    // this.dateAdapter.setLocale('th');
    // const initialDate = moment().add(543, 'years');
    // this.asset.purchaseDate = initialDate; // ใช้เลือกวันในปฎิทิน 
  }
  
  onSubmit(): void {
    this.http.post<any>('https://localhost:7204/api/AssetDetails', this.asset)
      .subscribe(
        response => {
          console.log(response);
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

  translateToEnglish(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "วันเดือนปี": "purchaseDate",
      "รหัสครุภัณฑ์": "assetCode",
      "รายการ": "assetName",
      "ราคาต่อหน่วย": "purchasePrice",
      "วิธีการได้มา": "purchasedFrom",
      "เลขที่เอกสาร": "documentNumber",
      "ฝ่าย": "department",
      "ผู้ใช้งาน": "responsibleEmployee",
      "หมายเหตุ": "note"
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
}

importExcel(event: any): void {
  const file: File = event.target.files[0];
  const reader: FileReader = new FileReader();

  reader.onload = (e: any) => {

    const data: string = e.target.result;

    const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });

    const worksheetName: string = workbook.SheetNames[0];

    const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];

    const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Convert the array of arrays into an array of objects
    const jsonArray: any[] = [];

    // Skip the first row (header row) as it contains column names
    for (let i = 1; i < excelData.length; i++) {
      const rowData = excelData[i];
      const jsonObject: any = {};

      for (let j = 0; j < rowData.length; j++) {
        const columnName = excelData[0][j]; // Get the column name from the header row
        let cellValue = rowData[j];

        // Convert date string to Date object if the column name indicates it's a date
        if (columnName.includes('ลำดับ')&& !isNaN(cellValue)) {
          // Skip conversion for 'ลำดับ' column
          continue;
        }
        if (columnName.includes('วันเดือนปี') || columnName.includes('วัน') || columnName.includes('ว.ด.ป.ที่ซื้อ')) {
          cellValue = this.convertToDate(cellValue);
        }

        jsonObject[columnName] = cellValue;
      }

      // Translate the data to English
      const translatedData = this.translateToEnglish(jsonObject);

      jsonArray.push(translatedData);
    }

    // Assign the converted data to the asset property
    this.asset = jsonArray;

    // Process the imported JSON data
    console.log(jsonArray);
    console.log(this.asset);
  };

  reader.readAsBinaryString(file);
}

  convertToDate(dateString: string): string {
    // Map ชื่อเดือนภาษาไทยเป็นเลขเดือน
    const monthMap: { [key: string]: number } = {
        'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5,
        'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11
    };

    // Split ข้อมูลวันที่เป็นส่วนๆ
    const dateParts = dateString.split(' ');

    // แยกวันที่ออกเป็นส่วนๆ
    const day = parseInt(dateParts[0], 10);
    
    const month = monthMap[dateParts[1]]; 
    
    const year = parseInt(dateParts[2], 10) ;

    // สร้างสตริงที่แสดงวันที่ในรูปแบบที่ต้องการ
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return formattedDate;
}
onSubmit2(): void {
  for (let i = 0; i < this.asset.length; i++) {
    const currentAsset = this.asset[i];
    this.http.post<any>('https://localhost:7204/api/AssetDetails', currentAsset)
      .subscribe(
        response => {
          console.log(response);
          Swal.fire({
            title: "บันทึกเสร็จสิ้น",
            icon: "success"
          })
        },
        error => {
          console.error(error);
          if (error) {
            Swal.fire({
              title: "มีข้อมูลในระบบอยู่แล้ว",
              icon: "error"
            }).then((result) => {
              if (result.isConfirmed) {
                // window.location.reload();
                console.log(currentAsset.purchaseDate);
              }
            });
          }
        }
      );
  }
}


}


