import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  TextColorDirective,
  InputGroupComponent,
  BorderDirective,
} from '@coreui/angular';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  AbstractControl,
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
import { AssetDetails2Component } from '../asset-details2/asset-details2.component';
import { SingleSelectionComponent } from '../single-selection/single-selection.component';
import Swal from 'sweetalert2';

import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
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

import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
  MomentDateModule,
  provideMomentDateAdapter,
} from '@angular/material-moment-adapter';

import 'moment/locale/th.js';
import { cilDataTransferUp } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ReplaySubject, Subject, firstValueFrom } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { jwtDecode } from 'jwt-decode';
import { DataService } from 'src/app/data-service/data-service.component';
import { ApiService } from 'src/app/api-service.service';

// Define the default options for Material Form Field
const formFieldOptions: MatFormFieldDefaultOptions = {
  hideRequiredMarker: true,
  // Optional: hide the required marker (*) globally
};

export interface asc {
  asc_Code: string;
  asc_Name: string;
}

@Component({
  selector: 'app-form-controls',
  templateUrl: 'system.component.html',
  styleUrls: ['./system.component.scss'],
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
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
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
      },
    },
    provideMomentDateAdapter({
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
    AssetDetails2Component,
    AssetDetails3Component,
    SingleSelectionComponent,
    TextColorDirective,

    MomentDateModule,

    MatNativeDateModule,
    MatTabsModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatFormField,
    MatLabel,
    MatDatepickerInput,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,

    CommonModule,
    BorderDirective,
    InputGroupComponent,

    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    FormsModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    NgIf,
    IconDirective,
    MatSelect,
    MatOption,
  ],
})
export class SystemComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('assetTypeselect') assetTypeSelect!: ElementRef;

  @ViewChild('assetCategorySelect') assetCategorySelect!: ElementRef;

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  icons = { cilDataTransferUp };

  colors = { color: 'primary', textColor: 'primary' };

  hidden: boolean = true;

  hidden2: boolean = true;

  assetDetails: any[] = [];

  openImport(): void {
    this.hidden2 = false;
    Swal.fire({
      title: 'กรอกข้อมูลที่จำเป็น',
      html: `
        <a href="link_to_sample_file">Download Sample File</a>
      `,
      icon: 'info'
    });
    window.open('https://example.com', '_blank');  
  }

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

  userinfo: any = [];

  token: any;

  fixedPrefix: string = '';

  fixedSuffix: string = '';

  editablePartLength: number = 15;

  public readinfo() {
    this.token = localStorage.getItem('token');

    const decodedToken = jwtDecode(this.token);

    this.userinfo = decodedToken;
  }

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private ap :ApiService
  )
  {

    this.readinfo();
    this.getAssetDetails();

    if (
      this.dataService.getAssetTypes() && this.dataService.getAssetCategory() === null
    ) {
      this.dataService.getAssetTypes().subscribe((assetTypes) => {
        this.assetTypes = Object.assign([], this.assetTypes, assetTypes);
      });

      this.dataService.getAssetCategory().subscribe((assetCategories) => {
        this.assetCategory = Object.assign(
          [],
          this.assetCategory,
          assetCategories
        );
      });

      // this.assetCategoryCtrl.setValue(this.assetCategory);
    } else {
      this
        .ap.fetchDatahttp('Assettypecodes')
        .subscribe((data) => {
          this.assetTypes = data;
        });

      this.ap
        .fetchDatahttp('Assetcategories')
        .subscribe((data) => {
          this.assetCategory = data;
          this.assetCategoryCtrl.setValue(this.assetCategory);
        });
    }
  }
  // เพิ่ม form control สำหรับ input เพิ่มเติม
  ngOnInit(): void {

    this.assetCategoryCtrl = this.formBuilder.control(null);

    // Initialize the form group
    this.asset = this.formBuilder.group({

      assetType: [''],
      
      assetCategory: [''],
      
      assetCode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[ก-๙]{3}\s\d{4}-\d{3}-\d{4}$/),
        ],
      ], // Set this initially as empty
      
      assetName: ['', Validators.required],
      
      quantity: ['1'],

      unit: [''],
      
      purchasedFrom: ['', Validators.required],
      
      department: [`${this.userinfo.position}`],
      
      agency: [`${this.userinfo.workgroup}`],
      
      assetLocation: ['', Validators.required],
      
      responsibleEmployee: ['', Validators.required],
      
      documentNumber: [''],
      
      purchasePrice: [''],
      
      CalculatedPrice: [''],
      
      purchaseDate: [''], //วันที่ซื้อ
      
      ReceiptDate: [''], //วันที่ได้รับ
      
      TaxInvoiceNumber: [''], //เลขที่ใบกำกับภาษี
      
      DepreciationRate: [''], //อัตราค่าเสื่อม

      AssetAge:[''],
      
      DepreciationStartDate: [''],
      
      DepreciationCalculationStartDate: [''],
      
      Note: [''],
      
      additionalInput: [''],
    });

    // this.asset.get('agency')?.valueChanges.subscribe(this.userinfo.workgroup);

    this.asset.get('assetCode')?.valueChanges.subscribe((value) => {
      const check = this.assetDetails.some(
        (asset) => asset.assetCode === value
      );
      if (check) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: 'error',
          html: `<span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: red;">รหัสรหัสครุภัณฑ์ซ้ำ</span>`,
        });
      } else {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: 'success',
          html: `<span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: green;">รหัสรหัสครุภัณฑ์ใช้ได้</span>`,
        });
      }
    });

    this.asset.get('ReceiptDate')?.valueChanges.subscribe((value) => {
      this.asset.patchValue({
        DepreciationStartDate: value,
        DepreciationCalculationStartDate: value,
      });
    });

    this.asset.get('assetType')?.valueChanges.subscribe(value => {
      console.log('DepreciationRate changed to:', value);
    
      const matchingAssetType = this.assetTypes.find(asset => asset.assetCode === value);
      if (matchingAssetType) {
        this.asset.get('DepreciationRate')?.setValue(matchingAssetType.rate_dep);
        this.asset.get('AssetAge')?.setValue(matchingAssetType.servicelife);
      }
      
    });
    
    this.asset.get('purchasePrice')?.valueChanges.subscribe((value) => {
      this.asset.patchValue({ CalculatedPrice: value });
    });

    // Function to update assetCode
    const updateAssetCode = () => {
      // const assetType = this.asset.get('assetType')?.value || '';

      const assetCategory = this.asset.get('assetCategory')?.value || '';

      const purchaseDate = this.asset.get('purchaseDate')?.value || '';

      let year = '';

      if (purchaseDate) {
        const date = new Date(purchaseDate);
        const isBuddhistEra = date.getFullYear() > 2500;
        year = isBuddhistEra
          ? date.getFullYear().toString()
          : (date.getFullYear() + 543).toString();
      }

      const newAssetCode = `${this.userinfo.affiliation} ${assetCategory}-001-${year}`;

      // Check if the new asset code already exists in assetDetails
      const isAssetCodeExist = this.assetDetails.some(
        (asset) => asset.assetCode === newAssetCode
      );

      if (isAssetCodeExist) {
        let suffix = 1;
        let newAssetCodeUnique = newAssetCode;

        // Find a unique asset code by incrementing the suffix
        while (
          this.assetDetails.some(
            (asset) => asset.assetCode === newAssetCodeUnique
          )
        ) {
          suffix++;
          newAssetCodeUnique = `${
            this.userinfo.affiliation
          } ${assetCategory}-${suffix.toString().padStart(3, '0')}-${year}`;
        }

        this.asset.patchValue({ assetCode: newAssetCodeUnique });
      } else {
        this.asset.patchValue({ assetCode: newAssetCode });
      }
    };

    // Subscribe to changes in ReceiptDate and update DepreciationStartDate and DepreciationCalculationStartDate

    // Subscribe to value changes on assetType, assetCategory, and purchaseDate
    this.asset.get('assetType')?.valueChanges.subscribe(updateAssetCode);

    this.asset.get('assetCategory')?.valueChanges.subscribe(updateAssetCode);

    this.asset.get('purchaseDate')?.valueChanges.subscribe(updateAssetCode);

    // Subscribe to value changes on assetCategoryFilterCtrl
    this.assetCategoryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterAssetCategories();
      });
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fixedPrefix = 'กกต 0401-'; // กำหนดค่า prefix คงที่
    const fixedSuffix = '-2567'; // กำหนดค่า suffix คงที่
    const editablePartLength = 3; // ความยาวของส่วนที่สามารถแก้ไขได้

    let value = input.value;

    // ตรวจสอบว่าค่า input มีรูปแบบที่ถูกต้อง
    const regex = /^กกต\s\d{4}-\d{3}-\d{4}$/;

    // หากค่า input ไม่ตรงกับรูปแบบ ให้ตั้งค่ากลับไปเป็นค่าที่อยู่ในฟอร์มควบคุม
    if (!regex.test(value)) {
      input.value = this.asset.get('assetCode')!.value;
    } else {
      // ดึงส่วนที่สามารถแก้ไขได้
      const editablePart = value.slice(
        fixedPrefix.length,
        fixedPrefix.length + editablePartLength
      );

      // ประกอบค่าใหม่
      const newValue = `${fixedPrefix}${editablePart}${fixedSuffix}`;

      // อัปเดตค่าใน input และฟอร์มควบคุม
      input.value = newValue;
      this.asset.get('assetCode')!.setValue(newValue);
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;

    // Prevent editing fixed parts of the input
    if (cursorPosition! < 10 || cursorPosition! >= 13) {
      event.preventDefault();
    }
  }

  //เรียกข้อมูลรายการครุทั้งหมด
  getAssetDetails(): void {

    // if (this.dataService.getAssetDetails()) {
    //   this.dataService.getAssetDetails().subscribe((data) => {
    //     this.assetDetails = data.filter((asset) => {
    //       if (this.userinfo.affiliation !== 'กกต.สกล') {
    //         return (
    //           asset.assetCode.startsWith(this.userinfo.affiliation) &&
    //           !asset.assetCode.includes(`${this.userinfo.affiliation}.`)
    //         );
    //       } 
    //       else {
    //         return (
    //           !asset.assetCode.startsWith('กกต.' && 'กกต') && //กันข้อมูลที่ขึ้นต้นด้วย  กกต.
    //           asset.agency.startsWith(`${this.userinfo.workgroup}`)
    //         );
    //       }
    //     });
    //     // .map((asset) => {
    //     //   asset.purchaseDate = this.convertDate(asset.purchaseDate);
    //     //   asset = this.translateToThai(asset);
    //     //   return asset;
    //     // });
    //     // Update the data source with the new asset details
    //     // this.dataSource.data = this.assetDetails;
    //   });
    // } 
    // else {
      this.ap
        .fetchDatahttp('AssetDetails')
        .subscribe((data) => {
          this.assetDetails = data.filter((asset: { assetCode: string; agency: string; }) => {
            if (this.userinfo.affiliation !== 'กกต.สกล') {
              return (
                asset.assetCode.startsWith(this.userinfo.affiliation) &&
                !asset.assetCode.includes(`${this.userinfo.affiliation}.`)
              );
            } else {
              return (
                !asset.assetCode.startsWith('กกต.' && 'กกต') && //กันข้อมูลที่ขึ้นต้นด้วย  กกต.
                asset.agency.startsWith(`${this.userinfo.workgroup}`)
              );
            }
          });
          // .map((asset) => {
          //   asset.purchaseDate = this.convertDate(asset.purchaseDate);
          //   asset = this.translateToThai(asset);
          //   return asset;
          // });
          // Update the data source with the new asset details
          // this.dataSource.data = this.assetDetails;
        });
    // }
  }

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filterAssetCategories(): void {
    const searchValue = this.assetCategoryFilterCtrl.value?.toLowerCase();
    const assetType = this.asset.get('assetType')?.value;

    const filteredAssetCategories = this.assetCategory.filter((category) => {
      return (
        category.assetCode === assetType &&
        (searchValue
          ? category.asc_Name.toLowerCase().includes(searchValue)
          : true)
      );
    });

    this.filteredAssetCategories.next(filteredAssetCategories);
  }

  showAlert(): void {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาเลือกประเภทก่อน',
      text: 'คุณต้องเลือกประเภทครุภัณฑ์ก่อนที่จะเลือกหมวดหมู่',
    });
  }

  async onSubmit(): Promise<void> {
    try {
      const response = await this.ap.postData('AssetDetails', this.asset.value);
      // console.log(response);
      
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: green;">บันทึกเสร็จสิ้น</span></h1>`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'OK',
      }).then((result) => {
        // หลังจากที่บันทึกข้อมูลเสร็จสิ้น ให้เรียกเมธอดเพื่ออัปเดตข้อมูล
        this.getAssetDetails();
        this.asset.reset();
        this.assetCategoryCtrl.reset();
      });
    } catch (error) {
      console.error(error);
      
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: red;">กรุณากรอกข้อมูลให้ครบ</span></h1>`,
        icon: 'error',
      });
  
      console.log(this.asset);
    }
  }
  

  translateToEnglish(asset: any): any {
    const translationMap: { [key: string]: string } = {
      
      วันเดือนปี: 'purchaseDate',
      
      วันเดือนปีที่รับ: 'ReceiptDate',

      รหัสครุภัณฑ์: 'assetCode',
      
      รายการ: 'assetName',
      
      ประเภทครุภัณฑ์:'assetType',
      
      หมวดหมู่ครุภัณฑ์:'assetCategory',
      
      ราคาต่อหน่วย: 'purchasePrice',
      
      วิธีการได้มา: 'purchasedFrom',
      
      เลขที่เอกสาร: 'documentNumber',
      
      ฝ่าย: 'department',
      
      หน่วยงาน: 'agency',
      
      ผู้ใช้งาน: 'responsibleEmployee',
      
      หมายเหตุ: 'note',
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

        for (let i = 1; i < excelData.length; i++) {
            const rowData = excelData[i];
            const jsonObject: any = {};

            for (let j = 0; j < rowData.length; j++) {
                const columnName = excelData[0][j];
                let cellValue = rowData[j];

                if (columnName.includes('ลำดับ') && !isNaN(cellValue)) {
                    continue;
                }
                if (columnName.includes('วันเดือนปี') || columnName.includes('วัน') || columnName.includes('ว.ด.ป.ที่ซื้อ')) {
                    if (cellValue) {
                        cellValue = this.convertToDate(cellValue);
                    }
                }

                jsonObject[columnName] = cellValue;
            }

            // Extract asset code prefix
            const assetCode = jsonObject['รหัสครุภัณฑ์'];

            if (assetCode && assetCode.startsWith('กกต')) {
                const assetCategoryCode = assetCode.split(' ')[1]?.split('-')[0];

                if (assetCategoryCode) {
                    // ใช้ some เพื่อค้นหาค่าใน assetCategory
                    const category = this.assetCategory.find(
                        (cat) => cat.asc_Code === assetCategoryCode
                    );

                    if (category) {
                        jsonObject['หมวดหมู่ครุภัณฑ์'] = category.asc_Code;

                        // ใช้ some เพื่อค้นหาค่าใน assetTypes
                        const assetType = this.assetTypes.find(
                            (type) => type.assetCode === category.assetCode
                        );

                        if (assetType) {
                            jsonObject['ประเภทครุภัณฑ์'] = assetType.assetCode;
                        } else {
                            console.error(`Asset type not found for code: ${category.assetCode}`);
                            continue; // Skip this row
                        }
                    } else {
                        console.error(`Category not found for code: ${assetCategoryCode}`);
                        continue; // Skip this row
                    }
                } else {
                    console.error(`Invalid asset code format: ${assetCode}`);
                    continue; // Skip this row
                }
            }

            const translatedData = this.translateToEnglish(jsonObject);
            jsonArray.push(translatedData);
        }

        if (jsonArray.length > 0) 
        {
            this.asset2 = jsonArray;
        } 
        else 
        {
            console.log('No valid data found in the imported file.');
        }
    };

    reader.readAsBinaryString(file);
}

  convertToDate(dateString: string): Date {
    const thaiMonths = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const parts = dateString.split(' ');

    if (parts.length !== 3) {
      throw new Error('Invalid date format');
    }

    const day = parseInt(parts[0], 10);
    const month = thaiMonths.indexOf(parts[1]);
    let year = parseInt(parts[2], 10);

    if (isNaN(day) || month === -1 || isNaN(year)) {
      throw new Error('Invalid date components');
    }

    if (this.isThaiYear(year)) {
      year = this.convertThaiToGregorian(year);
    }

    return new Date(year, month, day);
  }

  isThaiYear(year: number): boolean {
    return year > 2400; // Assuming any year greater than 2400 is a Thai year
  }

  convertThaiToGregorian(year: number): number {
    return year - 543; // Convert Buddhist year to Gregorian year
  }

  // convertToDate(dateString: string): string {
  //   // Map ชื่อเดือนภาษาไทยเป็นเลขเดือน
  //   const monthMap: { [key: string]: number } = {
  //     'ม.ค.': 0,
  //     'ก.พ.': 1,
  //     'มี.ค.': 2,
  //     'เม.ย.': 3,
  //     'พ.ค.': 4,
  //     'มิ.ย.': 5,
  //     'ก.ค.': 6,
  //     'ส.ค.': 7,
  //     'ก.ย.': 8,
  //     'ต.ค.': 9,
  //     'พ.ย.': 10,
  //     'ธ.ค.': 11,
  //   };

  //   // Split ข้อมูลวันที่เป็นส่วนๆ
  //   const dateParts = dateString.split(' ');

  //   // แยกวันที่ออกเป็นส่วนๆ
  //   const day = parseInt(dateParts[0], 10);

  //   const month = monthMap[dateParts[1]];

  //   const year = parseInt(dateParts[2], 10);

  //   // สร้างสตริงที่แสดงวันที่ในรูปแบบที่ต้องการ
  //   const formattedDate = `${year}-${(month + 1)
  //     .toString()
  //     .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  //   return formattedDate;
  // }

  // ตรวจสอบข้อมูลว่าถูกต้องตามเงื่อนไขหรือไม่
  validateAsset(asset: any): boolean {
    // ตรวจสอบข้อมูล asset.note หากเป็นตัวเลข ให้แปลงเป็นสตริง
    if (typeof asset.note === 'number') {
      asset.note = asset.note.toString();
    }

    // ตรวจสอบข้อมูลตามเงื่อนไขที่กำหนด
    if (
      asset.purchaseDate &&
      asset.assetCode &&
      asset.assetName &&
      asset.purchasePrice > 0
    ) {
      // ถ้าข้อมูลถูกต้องคืนค่าเป็น true
      return true;
    } else {
      Swal.fire({
        title: 'มีข้อมูลมีบางอย่างผิดพลาด',
        text: `Asset Code: ${asset.assetCode} มีข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง`,
        icon: 'error',
      });
      return false; // ถ้าข้อมูลไม่ถูกต้องคืนค่าเป็น false
    }
  }

  validateUniqueAssetCodes(assets: any[]): boolean {
    const assetCodeSet = new Set();
    for (const asset of assets) {
      if (assetCodeSet.has(asset.assetCode)) {
        Swal.fire({
          title: 'มีข้อมูลซ้ำกัน',
          text: `Asset Code: ${asset.assetCode} ซ้ำกันในไฟล์นำเข้า`,
          icon: 'error',
        });
        return false;
      }
      assetCodeSet.add(asset.assetCode);
    }
    return true;
  }

  async onSubmit2(): Promise<void> {
    // ตรวจสอบข้อมูลทั้งหมดก่อน
    if (!this.validateUniqueAssetCodes(this.asset2)) {
      return;
      // หยุดการทำงานถ้าพบข้อมูลซ้ำกัน
    }

    for (let i = 0; i < this.asset2.length; i++) {
      const asset = this.asset2[i];
      if (!this.validateAsset(asset)) {
        return;
        // หยุดการทำงานถ้าพบข้อมูลไม่ถูกต้อง
      }
    }

    // ถ้าข้อมูลทั้งหมดถูกต้อง ให้ส่งคำขอ HTTP เป็น batch
    const batchSize = 25;

    // ปรับขนาดของ batch ตามต้องการ
    for (let i = 0; i < this.asset2.length; i += batchSize) {
      const batch = this.asset2.slice(i, i + batchSize);
      await Promise.all(batch.map((asset: any) => this.sendRequest(asset)));
    }
  }

  private async sendRequest(asset: any): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>('https://localhost:7204/api/AssetDetails', asset)
      );
      console.log(response);
      Swal.fire({
        title: 'บันทึกเสร็จสิ้น',
        icon: 'success',
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'มีข้อมูลในระบบอยู่แล้วหรือข้อมูลไม่ถูกต้อง',
        text: `Error: ${error || 'Unknown error'}`,
        icon: 'error',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(asset.purchaseDate);
        }
      });
    }
  }

  toggleHidden(): void {
    this.hidden = !this.hidden; // เมื่อคลิกปุ่มจะเปลี่ยนค่า hidden เป็นค่าตรงกันข้าม
  }

  autoInput() {

    this.asset.get('quantity')?.setValue(1); //เซคจำนวน

    this.asset
      .get('CalculatedPrice')
      ?.setValue(this.asset.get('purchasePrice')?.value); //เซคราคาคำนวณ

    this.asset
      .get('DepreciationCalculationStartDate')
      ?.setValue(this.asset.get('ReceiptDate')?.value);

    this.asset
      .get('DepreciationStartDate')
      ?.setValue(this.asset.get('ReceiptDate')?.value);

      const assetTypesControlValue = this.asset.get('assetType')?.value;
      if (assetTypesControlValue) {
        const matchingAssetType = this.assetTypes.find(asset => asset.assetCode === assetTypesControlValue);
        
        if (matchingAssetType) {
          const depreciationRateControl = this.asset.get('DepreciationRate');
          if (depreciationRateControl) {
            depreciationRateControl.setValue(matchingAssetType.rate_dep);
          }
        }
        // console.log(this.asset.get('DepreciationRate')?.value);
      }

      
    if (this.userinfo.affiliation === 'กกต') {
      this.asset.get('agency')?.setValue(`${this.userinfo.workgroup}`); //เซตสังกัด หรือ สำนัก

      this.asset.get('department')?.setValue(`${this.userinfo.position}`); //เซตฝ่าย
    } else {
      // this.asset.get('agen')
    }

    const assetCodeInput = this.asset.get('assetCode');

    // const depreciationStartDateInput = this.asset.get('ReceiptDate');
    // const depreciationStartDateInput = this.asset.get('DepreciationStartDate');
    // depreciationStartDateInput?.value?.setValue(this.asset.get('DepreciationStartDate')?.value)

    if (assetCodeInput && assetCodeInput.value) {
      const currentValue = assetCodeInput.value;

      if (!currentValue.startsWith(`${this.userinfo.affiliation}`)) {
        assetCodeInput.setValue(
          `${this.userinfo.affiliation}` + ' ' + currentValue
        );
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
