import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, InputGroupComponent, BorderDirective } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { AssetDetails2Component } from '../asset-details2/asset-details2.component'
import {SingleSelectionComponent} from '../single-selection/single-selection.component'
import Swal from 'sweetalert2'

import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput } from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MomentDateModule, provideMomentDateAdapter } from '@angular/material-moment-adapter';

import 'moment/locale/th.js';
import { cilDataTransferUp } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Define the default options for Material Form Field
const formFieldOptions: MatFormFieldDefaultOptions = {
  hideRequiredMarker: true, // Optional: hide the required marker (*) globally
};
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import 'bootstrap-select/dist/js/bootstrap-select.js';
// import 'bootstrap-select/dist/css/bootstrap-select.css';
// // import 'boostrap';
// import 'bootstrap-select';
// import  $ from 'jquery';

export interface asc {
  asc_Code: string;
  asc_Name: string;
}

@Component({
  selector: 'app-form-controls',
  templateUrl: 'system.component.html',
  styleUrls:["./system.component.scss"],
  standalone: true,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: formFieldOptions,
    },
   
    
    
   
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
    AssetDetails2Component, AssetDetails3Component,SingleSelectionComponent,
    TextColorDirective,

    MomentDateModule,

    MatNativeDateModule, MatTabsModule, MatDatepicker, MatDatepickerToggle, MatFormField,
    MatLabel, MatDatepickerInput, MatFormFieldModule, MatInputModule,MatFormFieldModule,

    CommonModule,BorderDirective,

    CardComponent, CardHeaderComponent, CardBodyComponent, CardComponent,
    CardHeaderComponent, CardBodyComponent, InputGroupComponent,

    RowComponent, ColComponent,
    TextColorDirective,

    ReactiveFormsModule,NgxMatSelectSearchModule,

    FormsModule, FormDirective, FormLabelDirective, FormControlDirective,
    ButtonDirective, NgStyle, IconDirective,MatSelect,MatOption]

})

export class SystemComponent implements OnInit, AfterViewInit ,OnDestroy {

  @ViewChild('assetTypeselect') assetTypeSelect!: ElementRef;

  @ViewChild('assetCategorySelect') assetCategorySelect!: ElementRef;

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  icons = { cilDataTransferUp };

  colors = { color: 'primary', textColor: 'primary' }

  hidden: boolean = true;

  hidden2: boolean = true;

  openImport(): void { this.hidden2 = false; }

  asset: FormGroup = new FormGroup({}); // สร้าง object เพื่อเก็บข้อมูลสินทรัพย์ที่ผู้ใช้ป้อน
  
  asset2: any = {};

  assetTypes: any[] = [];

  assetCategory: any[] = [];
 
  assetCategoryCtrl: FormControl = new FormControl();

  assetCategoryFilterCtrl: FormControl = new FormControl('');

  filteredAssetCategories: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  _onDestroy = new Subject<void>();

  assetTypeInputVisible?: boolean;

  showAssetCategoryInput?: boolean;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder) 
    {
      this.http.get<any[]>('https://localhost:7204/api/Assettypecodes').subscribe(
        data => {
        this.assetTypes = data;
        console.log(this.assetTypes)
      });

      this.http.get<any[]>('https://localhost:7204/api/Assetcategories').subscribe(
        data => {
        this.assetCategory = data;
        this.assetCategoryCtrl.setValue(this.assetCategory);
        this.filteredAssetCategories.next(this.assetCategory.slice());
        console.log(this.assetCategory)
      });
    // if (this.asset.get('assetType') != null && this.asset.get('assetCategory') != null) {
    //   const assetTypeControl = this.asset.get('assetType');
    //   const assetCategoryControl = this.asset.get('assetCategory');
    //   if (assetTypeControl && assetCategoryControl) {
    //     const assetTypeValue = assetTypeControl.value;
    //     const filteredCategories = this.assetCategory.filter(category => category.assetCode === assetTypeValue);
    //     assetCategoryControl.setValue(filteredCategories);
    //   }
    // }
    // this.dateAdapter.setLocale('th');
    // const initialDate = moment().add(543, 'years');
    // this.asset.purchaseDate = initialDate; // ใช้เลือกวันในปฎิทิน 
  }

  // เพิ่ม form control สำหรับ input เพิ่มเติม
  ngOnInit(): void { 
    this.assetCategoryCtrl = this.formBuilder.control(null);

    this.asset = this.formBuilder.group({
      assetCode: ['', Validators.required],
      assetName: ['', Validators.required],
      quantity: ['1'],
      purchasedFrom: [''],
      assetType: [''],
      assetCategory: [''],
      department: [''],
      assetLocation: [''],
      responsibleEmployee: [''],
      documentNumber: [''],
      purchasePrice: [''],
      purchaseDate: [''],
      Note: [''],
      additionalInput: ['']
    });
    // Initialize the form group
   
    console.log(this.assetCategory);

    this.assetCategoryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterAssetCategories();
      });
  }

  

      ngAfterViewInit() {
        // this.setInitialValue();
    }

    ngOnDestroy(): void {
      this._onDestroy.next();
      this._onDestroy.complete();
    }
  
    filterAssetCategories(): void {
      let search = this.assetCategoryFilterCtrl.value;
      if (!search) {
        this.filteredAssetCategories.next(this.assetCategory.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      this.filteredAssetCategories.next(
        this.assetCategory.filter(category => category.asc_Name.toLowerCase().indexOf(search) > -1)
      );
    }
  
    setInitialValue(): void {
      this.filteredAssetCategories
        .pipe(take(1), takeUntil(this._onDestroy))
        .subscribe(() => {
          console.log(this.singleSelect);
          this.singleSelect.compareWith = (a: any, b: any) => a && b && a.asc_Name === b.asc_Name;
        });
    }
  

  selection(): void {
    if (this.assetTypeSelect) {
        const selectedValue = (this.assetTypeSelect.nativeElement as HTMLSelectElement).value;
        this.assetTypeInputVisible = (selectedValue === "0");
    }
}

  toggleAssetCategoryInputVisibility(): void {
      if (this.assetCategorySelect) {
          const selectedValue = (this.assetCategorySelect.nativeElement as HTMLSelectElement).value;
          this.showAssetCategoryInput = (selectedValue === "0");
      }
  }

  onSubmit(): void {
    this.http.post<any>('https://localhost:7204/api/AssetDetails', this.asset.value)
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
      this.asset.reset();
  }

  translateToEnglish(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "วันเดือนปี": 'purchaseDate',
      "รหัสครุภัณฑ์": 'assetCode',
      "รายการ": 'assetName',
      "ราคาต่อหน่วย": 'purchasePrice',
      "วิธีการได้มา": 'purchasedFrom',
      "เลขที่เอกสาร": 'documentNumber',
      "ฝ่าย": 'department',
      "ผู้ใช้งาน": 'responsibleEmployee',
      "หมายเหตุ": 'note'
    };

    const translatedAsset: any = {};
    for (const [key, value] of Object.entries(asset)) {
      const translatedKey = translationMap[key] || key;
      translatedAsset[translatedKey] = value;
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
          if (columnName.includes('ลำดับ') && !isNaN(cellValue)) {
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
      this.asset2 = jsonArray;

      // Process the imported JSON data
      // console.log(jsonArray);
      // console.log(this.asset2);
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

    const year = parseInt(dateParts[2], 10);

    // สร้างสตริงที่แสดงวันที่ในรูปแบบที่ต้องการ
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return formattedDate;
  }

  onSubmit2(): void {
    for (let i = 0; i < this.asset2.length; i++) {
      const currentAsset = this.asset2[i];
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

  // ตรวจสอบข้อมูลว่าถูกต้องตามเงื่อนไขหรือไม่
  validateAsset(asset: any): boolean {
    // ในที่นี้คุณสามารถเขียนเงื่อนไขตามที่คุณต้องการได้
    if (asset.purchaseDate && asset.assetCode) {
      return true; // ถ้าข้อมูลถูกต้องคืนค่าเป็น true
    }
    else {
      Swal.fire({
        title: "มีข้อมูลมีบางอย่างผิดพลาด",
        icon: "error"
      })
      return false; // ถ้าข้อมูลไม่ถูกต้องคืนค่าเป็น false
    }
  }

  toggleHidden(): void {
    this.hidden = !this.hidden; // เมื่อคลิกปุ่มจะเปลี่ยนค่า hidden เป็นค่าตรงกันข้าม
  }

  autoInput() {
    const assetCodeInput = this.asset.get('assetCode');
    if (assetCodeInput && assetCodeInput.value) {
        const currentValue = assetCodeInput.value;
        if (!currentValue.startsWith('กกต')) {
            assetCodeInput.setValue('กกต ' + currentValue);
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

  

  
}


