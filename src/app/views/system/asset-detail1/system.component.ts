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
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
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

    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    InputGroupComponent,

    RowComponent,
    ColComponent,
    TextColorDirective,

    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    FormsModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,NgIf,
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

  fixedPrefix: string = 'กกต 0401-';
  fixedSuffix: string = '-2567';
  editablePartLength: number = 3;


  public readinfo() {
    this.token = localStorage.getItem('token');

    const decodedToken = jwtDecode(this.token);

    this.userinfo = decodedToken;
  }

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.readinfo();

    this.http
      .get<any[]>('https://localhost:7204/api/Assettypecodes')
      .subscribe((data) => {
        this.assetTypes = data;
        // console.log(this.assetTypes);
      });

    this.http
      .get<any[]>('https://localhost:7204/api/Assetcategories')
      .subscribe((data) => {
        this.assetCategory = data;
        this.assetCategoryCtrl.setValue(this.assetCategory);
        // this.filteredAssetCategories.next(this.assetCategory.slice());
        // console.log(this.assetCategory);
      });
  }

  // เพิ่ม form control สำหรับ input เพิ่มเติม
  ngOnInit(): void {
    this.getAssetDetails();

    this.assetCategoryCtrl = this.formBuilder.control(null);
    // Initialize assetCategoryCtrl with a null value

    // Initialize the form group
    this.asset = this.formBuilder.group({
      assetType: [''],
      assetCategory: [''],
      assetCode: ['', [Validators.required,Validators.pattern(/^[ก-๙]{3}\s\d{4}-\d{3}-\d{4}$/)]], // Set this initially as empty
      assetName: ['', Validators.required],
      quantity: ['1'],
      unit:[''],
      purchasedFrom: ['', Validators.required],
      department: [`${this.userinfo.position}`],
      agency: [`${this.userinfo.workgroup}`],
      assetLocation: ['', Validators.required],
      responsibleEmployee: ['', Validators.required],
      documentNumber: [''],
      purchasePrice: [''],
      CalculatedPrice:[''],
      purchaseDate: [''], //วันที่ซื้อ
      ReceiptDate: [''], //วันที่ได้รับ
      TaxInvoiceNumber: [''], //เลขที่ใบกำกับภาษี
      DepreciationRate: [''], //อัตราค่าเสื่อม
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
      }
      else{
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

    this.asset.get('purchasePrice')?.valueChanges.subscribe((value) =>{
      this.asset.patchValue({CalculatedPrice : value});
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
    const value = input.value;
    const fixedPart = this.fixedPrefix;
    const suffix = this.fixedSuffix;
    const regex = /^กกต\s0401-\d{3}-2567$/;

    // Ensure the fixed parts are not modified
    if (!regex.test(value)) {
      input.value = this.asset.get('assetCode')!.value;
    } else {
      const editablePart = value.slice(fixedPart.length, fixedPart.length + this.editablePartLength);
      const newValue = `${fixedPart}${editablePart}${suffix}`;
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
    this.http
      .get<any[]>('https://localhost:7204/api/AssetDetails')
      .subscribe((data) => {
        this.assetDetails = data.filter((asset) => {
          if (this.userinfo.affiliation !== 'กกต') {
            return (
              asset.assetCode.startsWith(this.userinfo.affiliation) &&
              !asset.assetCode.includes(`${this.userinfo.affiliation}.`)
            );
          } else {
            return (
              !asset.assetCode.startsWith('กกต.') && //กันข้อมูลที่ขึ้นต้นด้วย  กกต.
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
  }

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  // filterAssetCategories(): void {
  //   let search = this.assetCategoryFilterCtrl.value;
  //   if (!search) {
  //     // this.filteredAssetCategories.next(this.assetCategory.slice());
  //     this.filteredAssetCategories.next(this.assetCategory.slice());//ใช้ระบุค่าใน
  //     return;
  //   } else {
  //     search = search.toLowerCase();
  //   }
  //   this.filteredAssetCategories.next(
  //     this.assetCategory.filter(
  //       (category) => category.asc_Name.toLowerCase().indexOf(search) > -1
  //     )
  //   );
  // }

  filterAssetCategories(): void {
    const searchValue = this.assetCategoryFilterCtrl.value?.toLowerCase();
    const assetType = this.asset.get('assetType')?.value;
  
    const filteredAssetCategories = this.assetCategory.filter(category => {
      return category.assetCode === assetType &&
        (searchValue? category.asc_Name.toLowerCase().includes(searchValue) : true);
    });
  
    this.filteredAssetCategories.next(filteredAssetCategories);
  }


  // setInitialValue(): void {
  //   this.filteredAssetCategories
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       console.log(this.singleSelect);
  //       this.singleSelect.compareWith = (a: any, b: any) =>
  //         a && b && a.asc_Name === b.asc_Name;
  //     });
  // }

  // selection(): void {
  //   if (this.assetTypeSelect) {
  //     const selectedValue = (
  //       this.assetTypeSelect.nativeElement as HTMLSelectElement
  //     ).value;
  //     this.assetTypeInputVisible = selectedValue === '0';
  //   }
  // }

  // toggleAssetCategoryInputVisibility(): void {
  //   if (this.assetCategorySelect) {
  //     const selectedValue = (
  //       this.assetCategorySelect.nativeElement as HTMLSelectElement
  //     ).value;
  //     this.showAssetCategoryInput = selectedValue === '0';
  //   }
  // }

  onSubmit(): void {
    this.http
      .post<any>('https://localhost:7204/api/AssetDetails', this.asset.value)
      .subscribe(
        (response) => {
          console.log(response);
          Swal.fire({
            html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: green;">บันทึกเสร็จสิ้น</span></h1>`,
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK'
          }).then((result) => {
          // หลังจากที่บันทึกข้อมูลเสร็จสิ้น ให้เรียกเมธอดเพื่ออัปเดตข้อมูล
            this.getAssetDetails();
            this.asset.reset();
            this.assetCategoryCtrl.reset();
          });
        },
        (error) => {
          console.error(error);
          if (error) {
            Swal.fire({
              html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: red;">กรุณากรอกข้อมูลให้ครบ</span></h1>`,
              icon: 'error',
            });
            console.log(this.asset);
          }
        }
      );
  }

  translateToEnglish(asset: any): any {
    const translationMap: { [key: string]: string } = {
      วันเดือนปี: 'purchaseDate',
      รหัสครุภัณฑ์: 'assetCode',
      รายการ: 'assetName',
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

      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

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
          if (
            columnName.includes('วันเดือนปี') ||
            columnName.includes('วัน') ||
            columnName.includes('ว.ด.ป.ที่ซื้อ')
          ) {
            if (cellValue) {
              cellValue = this.convertToDate(cellValue);
            }
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
      return true; // ถ้าข้อมูลถูกต้องคืนค่าเป็น true
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
      return; // หยุดการทำงานถ้าพบข้อมูลซ้ำกัน
    }

    for (let i = 0; i < this.asset2.length; i++) {
      const asset = this.asset2[i];
      if (!this.validateAsset(asset)) {
        return; // หยุดการทำงานถ้าพบข้อมูลไม่ถูกต้อง
      }
    }

    // ถ้าข้อมูลทั้งหมดถูกต้อง ให้ส่งคำขอ HTTP เป็น batch
    const batchSize = 25; // ปรับขนาดของ batch ตามต้องการ
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

    this.asset.get('CalculatedPrice')?.setValue(this.asset.get('purchasePrice')?.value); //เซคราคาคำนวณ

    this.asset
      .get('DepreciationCalculationStartDate')
      ?.setValue(this.asset.get('ReceiptDate')?.value);

    this.asset
      .get('DepreciationStartDate')
      ?.setValue(this.asset.get('ReceiptDate')?.value);

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
