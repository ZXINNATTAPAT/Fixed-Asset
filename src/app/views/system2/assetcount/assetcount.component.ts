import {
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  InputGroupComponent,
  BorderDirective,
} from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import {
  RowComponent,
  ColComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../api-service.service';
import Swal from 'sweetalert2';

import { MatNativeDateModule, MatOption } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerToggle,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { FormArray } from '@angular/forms';
// import 'moment/locale/th';
// import 'date-fns/locale/th';
import 'moment/locale/th.js';

import { IconDirective } from '@coreui/icons-angular';
import {
  cibAddthis,
  cilDataTransferDown,
  cilInfo,
  cilPencil,
  cilTrash,
} from '@coreui/icons';
import { ReplaySubject, Subject, Subscription, take, takeUntil } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

interface AssetDetails1 {
  Date: string;
  SerialNumber: string;
  DepartmentCode: string;
  LocationCode: string;
  Inspector: string;
  Verifier: string;
  Note: string;
  AssetId: string;
  AssetName: string;
  BookValue: string;
  InventoryValue: string;
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
  [key: string]: string | number; // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
}

@Component({
  selector: 'app-assetcount',
  standalone: true,
  imports: [
    TextColorDirective,
    NgxMatSelectSearchModule,
    MatSelect,
    MatNativeDateModule,
    MatTabsModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatFormField,
    MatLabel,
    MatDatepickerInput,
    MatFormFieldModule,
    MatInputModule,
    MatOption,

    CommonModule,
    BorderDirective,

    InputGroupComponent,

    RowComponent,
    ColComponent,
    TextColorDirective,

    MatTableModule,
    MatPaginator,
    MatSort,
    MatPaginatorModule,

    ReactiveFormsModule,
    FormsModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,

    ButtonDirective,
    NgStyle,
    IconDirective,
  ],
  templateUrl: './assetcount.component.html',
  styleUrl: './assetcount.component.scss',
})
export class AssetcountComponent implements OnInit {

  scanQr() {
  throw new Error('Method not implemented.');
  }

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  isFormControl(control: any): boolean {
    return control instanceof FormControl;
  }

  displayedColumns2: string[] = [
    'การดำเนินการ',
    'วันเดือนปี',
    'รหัสครุภัณฑ์',
    'รายการ',
    'ราคาต่อหน่วย',
    'วิธีการได้มา',
    'เลขที่เอกสาร',
    'แผนก',
    'ผู้ใช้งาน',
    'หมายเหตุ',
  ];

  displayedColumns: string[] = [
    'purchaseDate',
    'assetCode',
    'assetName',
    'purchasePrice',
    'purchasedFrom',
    'documentNumber',
    'department',
    'responsibleEmployee',
    'note',
  ];

  // displayedColumns3: string[] = ["รหัสครุภัณฑ์","รายการ","ยอดตามบัญชี","ยอดตรวจนับ","ผลต่าง","หมายเหตุ"];
  displayedColumns3: string[] = ['รหัสครุภัณฑ์', 'รายการ'];

  userinfo: any = [];

  token: any;

  public readinfo() {
    this.token = localStorage.getItem('token');

    const decodedToken = jwtDecode(this.token);

    this.userinfo = decodedToken;
  }

  private dataSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  editAsset(_t115: any) {
    throw new Error('Method not implemented.');
  }

  deleteAsset(_t115: any) {
    throw new Error('Method not implemented.');
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      purchaseDate: 'วันเดือนปี',
      assetCode: 'รหัสครุภัณฑ์',
      assetName: 'รายการ',
      purchasePrice: 'ราคาต่อหน่วย',
      purchasedFrom: 'วิธีการได้มา',
      documentNumber: 'เลขที่เอกสาร',
      department: 'แผนก',
      responsibleEmployee: 'ผู้ใช้งาน',
      note: 'หมายเหตุ',
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

  assetData: any[] = []; // Initialize assetData as an empty array

  dataSource!: MatTableDataSource<AssetDetails>; // Removed the initialization here

  dataSource2: any[] = []; // No changes
  
  assetDataCtrl: FormControl = new FormControl();

  assetdataFilterCtrl: FormControl = new FormControl('');

  filteredAssetData: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  _onDestroy = new Subject<void>();

  constructor(
    // private http: HttpClient,
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {
    this.getAssetDetails();
  }

  assetForm!: FormGroup; 
  
  form!: FormGroup; 

  getAssetDetails(): void {
    this.dataSubscription = this.apiService
      .fetchDatahttp('assetDetails')
      .subscribe((data) => {
        this.assetData = data.map((asset: any) => {
          asset.purchaseDate = this.convertDate(asset.purchaseDate);
          // asset = this.translateToThai(asset);
          return asset;
        });

        // console.log(this.assetData);

        // this.dataSource = new MatTableDataSource<AssetDetails>(this.assetData); 
        // Initialize dataSource here
      });
  }

  inputform: any[] = [];

  formArray!: FormArray; // No changes

  filterAsset(): void {
    let search = this.assetdataFilterCtrl.value;
    if (!search) {
      this.filteredAssetData.next(this.assetData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredAssetData.next(
      this.assetData.filter(
        (asset) => asset.assetCode.toLowerCase().indexOf(search) > -1
      )
    );
  }

  setInitialValue(): void {
    this.filteredAssetData
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        console.log(this.singleSelect);
        this.singleSelect.compareWith = (a: any, b: any) =>
          a && b && a.assetCode === b.assetCode;
      });
  }

  ngOnInit(): void {

    this.readinfo() ;

    this.assetdataFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.filterAsset();
    });

    this.assetForm = this.formBuilder.group({
      date: [new Date().toISOString()],
      serialNumber: [`${this.userinfo.affiliation}-ตน-0001`],
      departmentCode: [''],
      locationCode: [''],
      inspector: [''],
      verifier: [''],
      note: [''],
      assetId: [''],
      assetName: [''],
      // bookValue: [''],
      // inventoryValue: [''],
      formArray: this.formBuilder.array([]),
    });

    this.form = this.formBuilder.group({
      รหัสครุภัณฑ์: [''],
      รายการ: [''],
      // 'ยอดตามบัญชี': [''],
      // 'ยอดตรวจนับ': [''],
      // 'ผลต่าง': [''],
      // หมายเหตุ: [''],
    });

    this.formArray = this.assetForm.get('formArray') as FormArray;
    this.addform(); // Add initial form control
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      รหัสครุภัณฑ์: [''],
      รายการ: [''],
      // 'ยอดตามบัญชี': [''],
      // 'ยอดตรวจนับ': [''],
      // 'ผลต่าง': [''],
      // หมายเหตุ: [''],
    });
  }

  getAssetName(assetId: number): string {
    // หาชื่อของครุภัณฑ์จาก ID ของครุภัณฑ์
    const asset = this.assetData.find(data => data.assetId === assetId);
    return asset ? asset.assetName : '';
  }
  
  addform() {

    const newFormItem = this.createItem(); // Create a new form control

    this.formArray.push(newFormItem); // Add the new form control to the formArray

    this.inputform.push(newFormItem); // Add the new form control to the inputform array
  }

  onSubmit() {
    if (this.form.valid) {
      const requestBody = {
        data: [] as any[],
      };
  
      this.formArray.controls.forEach((control) => {
        if (control instanceof FormGroup) {
          let formData: any = {};
          Object.keys(control.value).forEach((key) => {
            formData[key] = control.value[key];
          });
          requestBody.data.push(formData);
        }
      });
  
      requestBody.data.forEach((item, index) => {
        const assetset = {
          date: this.assetForm.get('date')?.value,
          serialNumber: `${this.userinfo.affiliation}-ตน-0001`,
          departmentCode: this.assetForm.get('departmentCode')?.value,
          locationCode: this.assetForm.get('locationCode')?.value,
          inspector: this.assetForm.get('inspector')?.value,
          verifier: this.assetForm.get('verifier')?.value,
          note: this.assetForm.get('note')?.value,
          assetId: item.รหัสครุภัณฑ์,
          // assetName: item.assetName,
        };
        console.log(assetset);
      
      
        // ส่งข้อมูลไปยังเซิร์ฟเวอร์ที่อยู่ที่ https://localhost:7204/api/AssetInventory
        // this.http.post('https://localhost:7204/api/AssetInventory', data)
        //   .subscribe(
        //     (response) => {
        //       console.log('POST request successful: ', response);
        //       // ทำอะไรต่อไปหลังจากได้รับการตอบกลับจากเซิร์ฟเวอร์
        //     },
        //     (error) => {
        //       console.error('Error in POST request: ', error);
        //       // ประมวลผลข้อผิดพลาดหากมี
        //     }
        //   );
      });
    } else {
      console.error('Form is invalid. Please fill in all required fields or add more forms.');
    }
  }
  

  getSequence(index: number): number {
    return index + 1;
  }
}
