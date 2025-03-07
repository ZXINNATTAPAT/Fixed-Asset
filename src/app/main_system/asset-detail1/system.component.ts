import { Component, ElementRef, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, MatOption } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel, MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions, } from '@angular/material/form-field';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MomentDateModule, provideMomentDateAdapter, } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput, } from '@angular/material/datepicker';
import { FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { MatSelect, MatSelectChange } from '@angular/material/select';
// import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { cilDataTransferUp } from '@coreui/icons';
import { MatDialog } from '@angular/material/dialog';

import { AssetDetails2Component } from '../asset-details2/asset-details2.component';
import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import Swal from 'sweetalert2';

import 'moment/locale/th.js';

import { BehaviorSubject, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { DataService } from '../../data-service/data-service.component';
import { ApiService } from '../../ApiController/api-service.service';

import { AssetService } from './Service/asset.service'
import { FilterService } from './Service/filter.service';

import { UploadDialogComponent } from './Dialog/upload-dialog/upload-dialog.component';
import { DepreciationService } from './Service/depreciation.service';
import moment from 'moment';

const formFieldOptions: MatFormFieldDefaultOptions = {
  hideRequiredMarker: true,
  // Optional: hide the required marker (*) globally
};

export interface asc { asc_Code: string; asc_Name: string; }

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
    AssetDetails2Component, AssetDetails3Component, UploadDialogComponent,
    MomentDateModule, MatNativeDateModule, MatDatepicker, MatDatepickerToggle,
    MatLabel, MatDatepickerInput, MatFormFieldModule, MatInputModule,
    MatFormFieldModule, MatSelect, MatOption, MatFormField,
    FormsModule, FormDirective, FormLabelDirective, FormControlDirective,
    CommonModule, ReactiveFormsModule, NgxMatSelectSearchModule,
    ButtonDirective, NgStyle, NgIf,
  ],
})

export class SystemComponent implements OnInit, OnDestroy {

  // References for elements using @ViewChild
  @ViewChild('assetTypeselect') assetTypeSelect!: ElementRef;
  @ViewChild('assetCategorySelect') assetCategorySelect!: ElementRef;
  @ViewChild('factions') factionsElementRef!: ElementRef;

  // Asset-related properties
  // User info and token management
  userinfo: any = [];  
  asset: FormGroup = new FormGroup({});

  // เก็บชุดข้อมูลที่สร้าง
  generatedData: any[] = []; 
  asset2: any = {};
  assetDetails: any[] = [];
  assetTypes: any[] = [];
  factions: { FactId: number; Name: string; Semin: string; Code: string }[] = [];
  Department: any[] = [];
  assetCategory: any[] = [];
  countingUnits: any[] = [];

  //เชตจำนวนข้อมูลที่จะเพิ่ม
  numberOfCopies: number = 1;
  options: number[] = [];

  selectedFaction: string | null = null;
  isCustomInput: boolean = false;

  // เก็บวันที่ในรูปแบบ DD/MM/YY เพื่อแสดงผล
  displayDate: string = ''; 

  // Controls and filters for dropdowns
  assetCategoryCtrl: FormControl = new FormControl();
  assetCategoryFilterCtrl: FormControl = new FormControl('');

  unitCtrl      : FormControl = new FormControl();
  unitFilterCtrl: FormControl = new FormControl('');

  factionsCtrl: FormControl = new FormControl();
  factionsFilterCtrl: FormControl = new FormControl('');

  DepartmentCtrl: FormControl = new FormControl();
  DepartmentFilterCtrl: FormControl = new FormControl('');

  filteredAssetCategories: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  filteredUnits: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  filteredFactions: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  filteredDepartment: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  
  // Toggle visibility
  hidden: boolean = true; 
  hidden2: boolean = true; 
  showForm: boolean = false;
  
  // Fixed settings
  fixedPrefix: string = ''; 
  fixedSuffix: string = ''; 
  editablePartLength: number = 15; 

  //เซต Icon 
  icons = { cilDataTransferUp };
  colors = { color: 'primary', textColor: 'primary' };

  //เซต types บนตารางค่าเสื่อม
  depreciationSchedule: { year: string; bookValue: number; depreciation: number }[] = [];

  _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder, 
    private dataService: DataService, 
    private service: AssetService,
    private ap: ApiService, 
    private dialog: MatDialog,
    private depreciationService: DepreciationService,
    private filterService: FilterService) { }

  ngOnInit(): void {
      this.initializeUserInfo();
      this.loadAllData();
      this.initializeAssetForm();
      this.initializeValueChangeHandlers();
      this.loadInitialData();
      this.options = Array.from({ length: 25 }, (_, i) => i + 1); 
      // console.log(this.asset.value);
    
      // เรียก updateDepreciationSchedule เมื่อฟอร์มโหลดเสร็จ
      this.asset.valueChanges.pipe(
        debounceTime(700), // รอ 700 มิลลิวินาทีก่อนดำเนินการ
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ) // ตรวจสอบค่าที่เปลี่ยนจริง
      ).subscribe((formValues) => {
        const typeId = formValues.TypeId;
        const receiptDate = formValues.ReceiptDate;
        const purchasePrice = formValues.PurchasePrice;
    
        if (typeId && receiptDate && purchasePrice > 0) {
          // เรียก API เมื่อค่าฟอร์มครบถ้วน
          this.ap.fetchDatahttpbyId('Depreciations/type', typeId)
          .subscribe((depreciations) => {
            this.updateDepreciationSchedule(depreciations);
          });
        } else {
          console.log('กำลังรอข้อมูลเพิ่มเติม...');
        }
      });
  }

  // Load user information and handle it
  private initializeUserInfo(): void {
      // this.dataService.userInfo$.subscribe((userInfo) => {
      //   this.userinfo = userInfo;
      //   console.log('DefaultHeader UserInfo:', userInfo);
      // });
  }

  // Initialize the reactive form
  private initializeAssetForm(): void {
    this.asset = this.formBuilder.group({
      AssetId: [0, Validators.required],
      AssetCode: [''],
      AssetName: ['', Validators.required],
      Quantity: [1, [Validators.required, Validators.min(1)]],
      Unit: ['', Validators.required],
      PropertySeller: ['', Validators.required],
      TypeId: [0, Validators.required],
      CategoryId: [0, Validators.required],
      DepartmentId: [0, Validators.required],
      FactionId: [0, Validators.required],
      ResponsibleEmployee: ['', Validators.required],
      TaxInvoiceNumber: [''],
      PurchaseDate: ['', Validators.required],
      ReceiptDate: ['', Validators.required],
      DepreciationStartDate: ['', Validators.required],
      DepreciationCalculationStartDate: ['', Validators.required],
      PurchasePrice: [0, [Validators.required]],
      CalculatedPrice: [0, [Validators.required, Validators.min(0)]],
      ScrapPrice: [0, [Validators.required, Validators.min(0)]],
      DepreciationRate: [0, [Validators.required, Validators.min(0)]],
      AssetAge: [0, [Validators.required, Validators.min(0)]],
      DepreciationEndDate: [''],
      AccumulatedDepreciation: [0, [Validators.required, Validators.min(0)]],
      DepreciationValue: [0, [Validators.required, Validators.min(0)]],
      BookValue: [0, [Validators.required, Validators.min(0)]],
      Note: [''],
      StatusId: [1],
      SubAssets: this.formBuilder.array([]),
      numberOfCopies: [1]
    });
  }
  
  get subAssets(): FormArray { return this.asset.get('SubAssets') as FormArray; }

  addSubAsset(subAssetData?: any): void {
    this.subAssets.push(
      this.formBuilder.group({
        subAssetId: [subAssetData?.SubAssetId || 0, Validators.required], // SubAssetId
        assetId: [subAssetData?.AssetId || 0, Validators.required], // AssetId
        subAssetCode: [subAssetData?.SubAssetCode || '',Validators.required,], // SubAssetCode
        subAssetName: [subAssetData?.SubAssetName || '', Validators.required], // SubAssetName
        unit: [subAssetData?.Unit || '', Validators.required], // Unit
        assetLocation: [subAssetData?.AssetLocation || '',Validators.required,], // AssetLocation
        responsibleEmployee: [subAssetData?.ResponsibleEmployee || '',Validators.required,], // ResponsibleEmployee
        status: [subAssetData?.Status || ''], // Status
        note: [subAssetData?.Note || ''], // Note
        assetDetails: [subAssetData?.AssetDetails || ''], // AssetDetails
      })
    );
  }

  // Handle reactive form value changes
  private initializeValueChangeHandlers(): void {

    this.asset.get('TypeId')?.valueChanges.pipe(
      filter((typeId) => !!typeId),
      switchMap((typeId) => this.ap.fetchDatahttpbyId('Assetcategories/by-type', typeId))
    ).subscribe((data) => this.handleAssetCategoryChange(data));

    this.asset.get('TypeId')?.valueChanges.pipe(
      filter((typeId) => !!typeId), // ตรวจสอบว่า typeId ไม่เป็น null หรือ undefined
      switchMap((typeId) => this.ap.fetchDatahttpbyId('Depreciations/type', typeId)) // เรียก API
    ).subscribe((depreciations) => {
      this.updateDepreciationSchedule(depreciations);
    });
    
    // this.asset.get('typeId')?.valueChanges.subscribe((value) => this.updateDepreciationSchedule(value));

    this.asset.get('AssetCode')?.valueChanges.subscribe((value) => this.validateAssetCode(value));

    this.asset.get('ReceiptDate')?.valueChanges.subscribe((value) => {
      const isoDate = moment(value.clone().startOf('day').hours(8)).toISOString();
      if (value) {
        this.updateDisplayDate(value);
        this.asset.patchValue(
          {
            DepreciationStartDate: isoDate,
            DepreciationCalculationStartDate: isoDate,
          })
      }
    });
    
    this.asset.get('PurchasePrice')?.valueChanges.subscribe((value) => {
      this.asset.patchValue({ CalculatedPrice: value });
      // this.updateDepreciationSchedule(value);
    });

    const updateAssetCode = () => this.generateAssetCode();
    ['TypeId', 'CategoryId', 'PurchaseDate'].forEach((field) =>
      this.asset.get(field)?.valueChanges.subscribe(updateAssetCode)
    );


    this.asset.get('DepartmentId')?.valueChanges.subscribe((value) => this.filterFactionsByDepartment(value));

    [this.assetCategoryFilterCtrl, this.factionsFilterCtrl, this.DepartmentFilterCtrl, this.unitFilterCtrl]
      .forEach((ctrl, index) =>
        ctrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => this.handleFilterChange(index))
      );
  }

  // Load initial data for asset types and categories
  private loadInitialData(): void {
    this.ap.fetchDatahttp('Assettype').subscribe((data) => (this.assetTypes = data));
    this.assetCategoryCtrl = this.formBuilder.control(null);
  }

  // Update the asset category on type change
  private handleAssetCategoryChange(data: any): void {
    if (Array.isArray(data)) {
      this.assetCategory = data;
      this.assetCategoryCtrl.setValue(null);
      console.log('Asset Categories:', this.assetCategory);
    } else {
      console.error('Unexpected data format:', data);
    }
  }

  // เมื่อเลือกวันที่ใน mat-datepicker
  onDateChange(event: any) {
    const selectedDate = event.value;
    // console.log(selectedDate);
    if (selectedDate) {
      const isoDate = moment(selectedDate.clone().startOf('day').hours(8)).toISOString(); // แปลงเป็น ISO 8601
      // console.log(isoDate);
      // console.log(moment(selectedDate));
      this.asset.patchValue({ ReceiptDate: isoDate }, { emitEvent: false });
      this.updateDisplayDate(selectedDate); // อัปเดตค่าแสดงผล
    }
  }
  
  onDateChange2(event: any) {
    const selectedDate = event.value;
    // console.log(selectedDate);
    if (selectedDate) {
      const isoDate = moment(selectedDate.clone().startOf('day').hours(8)).toISOString(); // แปลงเป็น ISO 8601
      // console.log(isoDate);
      // console.log(moment(selectedDate));
      this.asset.patchValue({ PurchaseDate: isoDate }, { emitEvent: false });
  
    }
  }

  // อัปเดตวันที่แสดงผลเป็น DD/MM/YY
  private updateDisplayDate(date: any) {
    this.displayDate = moment(date).format('DD/MM/YY');
  }

  // ฟังก์ชันสร้างข้อมูล
  generateData(): void {
    const formValue = this.asset.value; // ค่าจากฟอร์มหลัก
    const quantity = formValue.quantity; // จำนวนชุดที่ต้องการ

    if (quantity <= 0) {
      console.error('Invalid quantity value');
      return;
    }

    // สร้างชุดข้อมูลตามจำนวนที่ระบุ
    this.generatedData = Array.from({ length: quantity }, (_, index) => ({
      ...formValue,
      assetId: formValue.assetId + index + 1, // เพิ่ม ID ตามลำดับ
      note: `${formValue.note || ''} ชุดที่ ${index + 1}` // เพิ่มหมายเหตุแยกแต่ละชุด
    }));

    console.log('Generated Data:', this.generatedData);
  }

  // Validate asset code uniqueness
  private validateAssetCode(value: string): void {
    const isDuplicate = this.assetDetails.some((asset) => asset.AssetCode === value);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: isDuplicate ? 'error' : 'success',
      html: `<span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: ${isDuplicate ? 'red' : 'green'
        };">${isDuplicate ? 'รหัสรหัสครุภัณฑ์ซ้ำ' : 'รหัสรหัสครุภัณฑ์ใช้ได้'}</span>`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  // Generate a unique asset code based on form values
  private generateAssetCode(): void {
    const category = this.assetCategory.find(
      (type) => type.CategoryId === this.asset.get('CategoryId')?.value
    );
    const purchaseDate = this.asset.get('PurchaseDate')?.value;
    const year = purchaseDate ? new Date(purchaseDate).getFullYear() + 543 : '';
    if (!category || !year) return;

    const payload = {
      Affiliation: 'กกต',
      AssetCategory: category.CategoryCode,
      Year: year.toString(),
    };

    this.ap.generateAssetCode(payload).subscribe({
      next: (response) => {
        if (response && response.assetCode) {
          this.handleGeneratedAssetCode(response.assetCode, year.toString());
        } else {
          console.error('Response does not contain assetCode.');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Asset code generation failed. Please try again.',
          });
        }
      },
      error: (err) => {
        console.error('Error generating asset code:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to generate asset code. Please check your connection or try again later.',
        });
      },
    });
    
  }

  private handleGeneratedAssetCode(generatedCode: string, year: string): void {
    const isDuplicate = this.assetDetails.some((asset) => asset.AssetCode === generatedCode);
    if (isDuplicate) {
      let suffix = 1;
      while (
        this.assetDetails.some((asset) => asset.AssetCode === `${generatedCode.split('-')[0]}-${suffix}-${year}`)
      ) {
        suffix++;
      }
      generatedCode = `${generatedCode.split('-')[0]}-${suffix}-${year}`;
    }
    this.asset.patchValue({ AssetCode: generatedCode });
  }

  // Filter factions by department
  private filterFactionsByDepartment(departmentId: string): void {
    const department = this.Department.find((c) => c.DeptId === departmentId);
    const factions = department ? department.Factions : [];
    this.filteredFactions.next(factions);
    this.factions = factions;
  }

  // Generic filter handler
  private handleFilterChange(index: number): void {
    const filters = [this.filterAssetCategories, this.filterFactions, this.filterDepartments, this.filterUnits];
    filters[index].call(this);
  }

  private loadAllData(): void {
    //############# เปลี่ยนไปใช้ Backend หา ข้อมูลล่าสุดแต่ละปีแล้วส่งมา /AssetDetails/generate-code
    // Load assetDetails
    // this.ap.fetchDatahttp('AssetDetails').pipe(catchError(() => of([]))).subscribe(
    //   (assetDetails) => {
    //     this.assetDetails = assetDetails.filter((asset: { AssetCode: string }) => {
    //       // console.log(assetDetails);
    //       const affiliation = this.userinfo?.Affiliation;
    //       return affiliation !== 'ส่วนกลาง'
    //         ? asset.AssetCode.startsWith('กกต') && !asset.AssetCode.includes(`${affiliation}.`)
    //         : !asset.AssetCode.startsWith('กกต.');
    //     });
    //     // console.log('AssetDetails:', this.assetDetails);
    //   },
    //   (error) => {
    //     console.error('Error fetching assetDetails:', error);
    //   }
    // ); // #########################################################

    // Load countingUnits
    // this.ap.fetchDatahttp('Countingunits').pipe(catchError(() => of([]))).subscribe(
    //   (countingUnits) => {
    //     this.countingUnits = countingUnits;
    //     this.filteredUnits.next(this.countingUnits.slice());
    //     // console.log('CountingUnits:', this.countingUnits);
    //   },
    //   (error) => {
    //     console.error('Error fetching countingUnits:', error);
    //   }
    // );

    const resourceId = '5b2605ca-cd5c-4034-bc35-3c681c6fedaa';

    this.ap.getData(resourceId).pipe(
      catchError(() => {
        console.error('Error fetching countingUnits. Defaulting to empty array.');
        return of([]);
      })
    ).subscribe(
      (response) => {
        if (response?.result?.records) {
          // แปลงชื่อฟิลด์จาก 'คำ' เป็น 'word'
          this.countingUnits = response.result.records.map((unit: any) => {
            return {
              word: unit.ลักษณนาม, // แปลง 'คำ' เป็น 'word'
              // ลักษณนาม: unit.ลักษณนาม, // คงไว้เหมือนเดิม
              // ...unit, // เก็บฟิลด์เดิมอื่น ๆ ไว้ (ถ้ามี)
            };
          });
    
          this.filteredUnits.next(this.countingUnits.slice());
          console.log('CountingUnits:', this.countingUnits);
        } else {
          console.warn('No records found for Countingunits.');
        }
      },
      (error) => {
        console.error('Error fetching countingUnits:', error);
      }
    );
    

    this.ap.fetchDatahttp('Departments').pipe(
      catchError((error) => {
        console.error('Error fetching departments and factions:', error);
        return of({ Factions: [], Departments: [] }); // Provide default structure
      })).subscribe((response: any) => {
        // Extract Factions and Departments from the response
        const setdata = response
        this.Department = setdata || [];

        this.filteredDepartment.next(this.Department);

        // Debugging logs
        // console.log('Factions:', this.factions);
        console.log('Departments:', this.Department);
      });

    this.setupFilterListeners();

  }

  openUploadDialog(): void {
    this.dialog.open(UploadDialogComponent, {
      width: '600px',
      data: { assetCategory: this.assetCategory, assetTypes: this.assetTypes },
    });

  }
  
  async onSubmit(): Promise<void> {
    try {
      // Validate form data
      // if (this.asset.invalid) {
      //   throw new Error('Form is invalid.');
      // }
  
      if (!this.asset.get("numberOfCopies")?.value || this.asset.get("numberOfCopies")?.value <= 0) {
        throw new Error('Number of copies must be greater than 0.');
      }
  
      // Extract form data
      const payload: any = { ...this.asset.value };

      const count = this.asset.get("numberOfCopies")?.value;
  
      // Generate array of payloads
      const dataToSend: any[] = [];
      for (let i = 0; i < count; i++) {
        dataToSend.push({ ...payload, uniqueKey: `${payload.assetName}-${i + 1}` });
      }
  
      // Post data to the API
      await this.ap.postData('AssetDetails', dataToSend);
  
      // Notify user of success
      console.log('Data submitted successfully.');
    
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 600; color: green;">บันทึกเสร็จสิ้น</span></h1>`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'OK',
      }).then((result) => {
        this.loadAllData();
        this.asset.reset();
        this.assetCategoryCtrl.reset();
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 600; color: red;">กรุณากรอกข้อมูลให้ครบ</span></h1>`,
        icon: 'error',
      });
      console.log(this.asset);
    }
  }

  autoInput() {
    this.asset.get('Quantity')?.setValue(1); //เซคจำนวน
    this.asset.get('CalculatedPrice')?.setValue(this.asset.get('PurchasePrice')?.value); //เซคราคาคำนวณ
    this.asset.get('DepreciationCalculationStartDate')?.setValue(this.asset.get('ReceiptDate')?.value);
    this.asset.get('DepreciationStartDate')?.setValue(this.asset.get('ReceiptDate')?.value);

    const assetTypesControlValue = this.asset.get('AssetType')?.value;
    if (assetTypesControlValue) {

      const matchingAssetType = this.assetTypes.find(asset => asset.AssetCode === assetTypesControlValue);

      if (matchingAssetType) {
        const depreciationRateControl = this.asset.get('DepreciationRate');

        if (depreciationRateControl) {
          depreciationRateControl.setValue(matchingAssetType.rate_dep);
        }
      }
    }


    if (this.userinfo.Affiliation === 'ส่วนกลาง') {
      this.asset.get('DepartmentId')?.setValue(`${this.userinfo?.DepartmentId}`); //เซตสังกัด หรือ สำนัก
      this.asset.get('FactionId')?.setValue(`${this.userinfo?.FactionId}`); //เซตฝ่าย
    } else {
      // this.asset.get('agen')
    }

    const assetCodeInput = this.asset.get('AssetCode');

    // const depreciationStartDateInput = this.asset.get('ReceiptDate');
    // const depreciationStartDateInput = this.asset.get('DepreciationStartDate');
    // depreciationStartDateInput?.value?.setValue(this.asset.get('DepreciationStartDate')?.value)

    if (assetCodeInput && assetCodeInput.value) {
      const currentValue = assetCodeInput.value;

      if (!currentValue.startsWith(`กกต`)) {
        assetCodeInput.setValue(
          `กกต` + ' ' + currentValue
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
      input.value = this.asset.get('AssetCode')!.value;
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
      this.asset.get('AssetCode')!.setValue(newValue);
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

  private filterAssetCategories(): void {
    const searchValue = this.assetCategoryFilterCtrl.value;
    this.filterService.filterAssetCategories(this.assetCategory, searchValue).subscribe((filtered) => {
      this.filteredAssetCategories.next(filtered); // Emit the filtered data
    });
  }

  private filterUnits(): void {
    const searchValue = this.unitFilterCtrl.value?.toLowerCase() || '';
    const filtered = this.countingUnits.filter((unit) =>
      unit.word.toLowerCase().includes(searchValue)
    );
    this.filteredUnits.next(filtered);
  }

  private filterFactions(): void {
    const searchValue = this.factionsFilterCtrl.value?.toLowerCase() || '';
    this.filterService.filterFactions(this.factions, searchValue).subscribe((faction) => {
      this.filteredFactions.next(faction);
    }
    );

  }

  private filterDepartments(): void {
    const searchValue = this.DepartmentFilterCtrl.value?.toLowerCase() || '';
    this.filterService.filterDepartments(this.Department, searchValue).subscribe((department) => {
      this.filteredDepartment.next(department)
    }
    );
  }

  private setupFilterListeners(): void {
    this.assetCategoryFilterCtrl.valueChanges.subscribe(() => {
      this.filterAssetCategories();
    });

    this.unitFilterCtrl.valueChanges.subscribe(() => {
      this.filterUnits();
    });

    this.factionsFilterCtrl.valueChanges.subscribe(() => {
      this.filterFactions();
    });

    this.DepartmentFilterCtrl.valueChanges.subscribe(() => {
      this.filterDepartments();
    });
  }

  // Handle faction selection
  onFactionChange(event: MatSelectChange): void {
    console.log('Selected value:', event.value); // e.g., "ฝวส"
    this.asset.patchValue({ FactionId: event.value }); // Update form control value
  }

  onDepartmentChange(event: MatSelectChange): void {
    const selectedDeptId = event.value;
    const department = this.Department.find((dept) => dept.DeptId === selectedDeptId);

    if (department) {
      this.filteredFactions.next(department.Factions || []);
    } else {
      this.filteredFactions.next([]);
    }
  }

  onUnitChange(event: MatSelectChange): void {
    // console.log('Selected value:', event.value);
    // console.log('MatSelect source:', event.source); 
    this.asset.patchValue({ Unit: event.value }); // Update form control value
  }

  private updateDepreciationSchedule(depreciations: any): void {

    // console.log('Received Depreciations:', depreciations);
  
    // ตรวจสอบว่า depreciations มีข้อมูลหรือไม่
    if (!depreciations || depreciations.length === 0) {
      console.log('ไม่พบข้อมูลค่าเสื่อมราคา');
      this.asset.get('DepreciationRate')?.setValue('');
      this.asset.get('AssetAge')?.setValue('');
      return;
    }
  
    // ดึงข้อมูลค่าเสื่อมราคาและอายุการใช้งาน
    const depreciationRate = depreciations[0]?.Rate_dep || null;
    const assetAge = depreciations[0]?.Servicelife || null;
  
    // ตั้งค่าฟอร์ม
    this.asset.get('DepreciationRate')?.setValue(depreciationRate, { emitEvent: false });

    this.asset.get('AssetAge')?.setValue(assetAge, { emitEvent: false });
  
    console.log('Depreciation Rate:', depreciationRate);
    
    console.log('Asset Age:', assetAge);
  
    // ดึงข้อมูลจากฟอร์ม
    const purchasePrice = this.asset.get('PurchasePrice')?.value || 0;

    const receiptDate = this.asset.get('ReceiptDate')?.value || '';
  
    // ตรวจสอบข้อมูลก่อนคำนวณ
    if (purchasePrice > 0 && depreciationRate > 0 && receiptDate) {
      // คำนวณตารางค่าเสื่อมราคา
      const schedule = this.depreciationService.calculateDepreciationWithPartialYear(
        purchasePrice,
        depreciationRate,
        receiptDate
      );
  
      console.log('Depreciation Schedule:', schedule);

      this.asset.get('AccumulatedDepreciation')?.setValue(schedule[0].accumulatedDepreciation);
      this.asset.get('BookValue')?.setValue(schedule[0].bookValue);
      this.asset.get('DepreciationValue')?.setValue(schedule[0].depreciation);
  
      // ตั้งค่าผลลัพธ์ในฟอร์ม (ถ้าต้องการ)
      // this.asset.get('accumulatedDepreciation')?.setValue(schedule);
    } else {
      console.log('ข้อมูลไม่ครบสำหรับการคำนวณ');
    }
    console.log('Current Values:', {
      purchasePrice,
      receiptDate,
      depreciationRate,
      assetAge,
    });
  }
  
  toggleHidden(): void { this.hidden = !this.hidden; }// เมื่อคลิกปุ่มจะเปลี่ยนค่า hidden เป็นค่าตรงกันข้าม

  removeSubAsset(index: number): void { this.subAssets.removeAt(index); }

  ngOnDestroy(): void { this._onDestroy.next(); this._onDestroy.complete(); }

  translateToEnglish(asset: any): any { this.service.translateToEnglish(asset); }

  convertToDate(dateString: string): Date { return this.service.convertToDate(dateString); }

  showAlert(): void { this.service.showAlert(); }

  toggleForm(): void {this.showForm = !this.showForm;}
  
  enableCustomInput(): void { this.isCustomInput = true; this.selectedFaction = null; }

  disableCustomInput(): void { this.isCustomInput = false; this.asset.patchValue({ assetLocation: '' }); }

}
