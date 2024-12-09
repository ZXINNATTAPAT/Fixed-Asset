import { Component, ElementRef, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, MatOption } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel, MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions, } from '@angular/material/form-field';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MomentDateModule, provideMomentDateAdapter, } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput, } from '@angular/material/datepicker';
import { FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { cilDataTransferUp } from '@coreui/icons';
import { MatDialog } from '@angular/material/dialog';

import { AssetDetails2Component } from '../asset-details2/asset-details2.component';
import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import Swal from 'sweetalert2';

import 'moment/locale/th.js';

import { BehaviorSubject, Subject, of } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { DataService } from 'src/app/data-service/data-service.component';
import { ApiService } from 'src/app/ApiController/api-service.service';

import { AssetService } from './Service/asset.service'
import { FilterService } from './Service/filter.service';

import { UploadDialogComponent } from './Dialog/upload-dialog/upload-dialog.component';

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

  // @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  // Asset-related properties
  userinfo: any = [];  // User info and token management
  asset: FormGroup = new FormGroup({});
  asset2: any = {};
  assetDetails: any[] = [];
  assetTypes: any[] = [];
  factions: { FactId: number; Name: string; Semin: string; Code: string }[] = [];
  Department: any[] = [];
  assetCategory: any[] = [];
  countingUnits: any[] = [];

  selectedFaction: string | null = null;

  isCustomInput: boolean = false;

  // Controls and filters for dropdowns
  assetCategoryCtrl: FormControl = new FormControl();
  assetCategoryFilterCtrl: FormControl = new FormControl('');

  unitCtrl: FormControl = new FormControl();
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
  hidden: boolean = true;hidden2: boolean = true;

  // Fixed settings
  fixedPrefix: string = '';fixedSuffix: string = '';editablePartLength: number = 15;

  icons = { cilDataTransferUp };colors = { color: 'primary', textColor: 'primary' };

  _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService, private service: AssetService,
    private ap: ApiService, private dialog: MatDialog,
    private filterService: FilterService) { }

  ngOnInit(): void {
    this.initializeUserInfo();
    this.loadAllData();
    this.initializeAssetForm();
    this.initializeValueChangeHandlers();
    this.loadInitialData();
    console.log(this.asset.value);
  }

  // Load user information and handle it
  private initializeUserInfo(): void {
      this.dataService.userInfo$.subscribe((userInfo) => {
        this.userinfo = userInfo;
        console.log('DefaultHeader UserInfo:', userInfo);
      });
  }

  // Initialize the reactive form
  private initializeAssetForm(): void {
    this.asset = this.formBuilder.group({
      assetId: [0, Validators.required],
      assetCode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-]+$/)]],
      assetName: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitId: [0, Validators.required],
      propertySellerId: ['', Validators.required],
      typeId: [0, Validators.required],
      categoryId: [0, Validators.required],
      departmentId: ['', Validators.required],
      factionId: ['', Validators.required],
      documentNumber: ['', Validators.required],
      responsibleEmployee: ['', Validators.required],
      taxInvoiceNumber: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      receiptDate: ['', Validators.required],
      depreciationStartDate: ['', Validators.required],
      depreciationCalculationStartDate: ['', Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      calculatedPrice: [0, [Validators.required, Validators.min(0)]],
      scrapPrice: [0, [Validators.required, Validators.min(0)]],
      depreciationRate: [0, [Validators.required, Validators.min(0)]],
      assetAge: [0, [Validators.required, Validators.min(0)]],
      depreciationEndDate: ['', Validators.required],
      accumulatedDepreciation: [0, [Validators.required, Validators.min(0)]],
      depreciationValue: [0, [Validators.required, Validators.min(0)]],
      bookValue: [0, [Validators.required, Validators.min(0)]],
      note: [''],
      statusId: [0, Validators.required],
      subAssets: this.formBuilder.array([]),
    });
  }

  // Handle reactive form value changes
  private initializeValueChangeHandlers(): void {
    this.asset.get('typeId')?.valueChanges.pipe(
      filter((typeId) => !!typeId),
      switchMap((typeId) => this.ap.fetchDatahttpbyId('Assetcategories/by-type', typeId))
    ).subscribe((data) => this.handleAssetCategoryChange(data));

    this.asset.get('assetCode')?.valueChanges.subscribe((value) => this.validateAssetCode(value));

    this.asset.get('receiptDate')?.valueChanges.subscribe((value) => {
      this.asset.patchValue({
        depreciationStartDate: value,
        depreciationCalculationStartDate: value,
      });
    });

    this.asset.get('typeId')?.valueChanges.subscribe((value) => this.updateDepreciation(value));

    this.asset.get('purchasePrice')?.valueChanges.subscribe((value) => {
      this.asset.patchValue({ calculatedPrice: value });
    });

    const updateAssetCode = () => this.generateAssetCode();
    ['typeId', 'categoryId', 'purchaseDate'].forEach((field) =>
      this.asset.get(field)?.valueChanges.subscribe(updateAssetCode)
    );

    this.asset.get('departmentId')?.valueChanges.subscribe((value) => this.filterFactionsByDepartment(value));

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

  // Validate asset code uniqueness
  private validateAssetCode(value: string): void {
    const isDuplicate = this.assetDetails.some((asset) => asset.assetCode === value);
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

  // Update depreciation values based on type
  private updateDepreciation(typeId: number): void {
    const matchingAssetType = this.assetTypes.find((asset) => asset.assetCode === typeId);
    if (matchingAssetType) {
      this.asset.patchValue({
        depreciationRate: matchingAssetType.rate_dep,
        assetAge: matchingAssetType.servicelife,
      });
    }
  }

  // Generate a unique asset code based on form values
  private generateAssetCode(): void {
    const category = this.assetCategory.find(
      (type) => type.CategoryId === this.asset.get('categoryId')?.value
    );
    const purchaseDate = this.asset.get('purchaseDate')?.value;
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
    const isDuplicate = this.assetDetails.some((asset) => asset.assetCode === generatedCode);
    if (isDuplicate) {
      let suffix = 1;
      while (
        this.assetDetails.some((asset) => asset.assetCode === `${generatedCode.split('-')[0]}-${suffix}-${year}`)
      ) {
        suffix++;
      }
      generatedCode = `${generatedCode.split('-')[0]}-${suffix}-${year}`;
    }
    this.asset.patchValue({ assetCode: generatedCode });
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
    this.ap.fetchDatahttp('Countingunits').pipe(catchError(() => of([]))).subscribe(
      (countingUnits) => {
        this.countingUnits = countingUnits;
        this.filteredUnits.next(this.countingUnits.slice());
        // console.log('CountingUnits:', this.countingUnits);
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

  get subAssets(): FormArray { return this.asset.get('subAssets') as FormArray; }

  addSubAsset(subAssetData?: any): void {
    this.subAssets.push(
      this.formBuilder.group({
        subAssetId: [subAssetData?.SubAssetId || 0, Validators.required], // SubAssetId
        assetId: [subAssetData?.AssetId || 0, Validators.required], // AssetId
        subAssetCode: [
          subAssetData?.SubAssetCode || '',
          Validators.required,
        ], // SubAssetCode
        subAssetName: [subAssetData?.SubAssetName || '', Validators.required], // SubAssetName
        unit: [subAssetData?.Unit || '', Validators.required], // Unit
        assetLocation: [
          subAssetData?.AssetLocation || '',
          Validators.required,
        ], // AssetLocation
        responsibleEmployee: [
          subAssetData?.ResponsibleEmployee || '',
          Validators.required,
        ], // ResponsibleEmployee
        status: [subAssetData?.Status || ''], // Status
        note: [subAssetData?.Note || ''], // Note
        assetDetails: [subAssetData?.AssetDetails || ''], // AssetDetails
      })
    );
  }

  toggleHidden(): void { this.hidden = !this.hidden; }// เมื่อคลิกปุ่มจะเปลี่ยนค่า hidden เป็นค่าตรงกันข้าม

  removeSubAsset(index: number): void { this.subAssets.removeAt(index); }

  ngOnDestroy(): void { this._onDestroy.next(); this._onDestroy.complete(); }

  translateToEnglish(asset: any): any { this.service.translateToEnglish(asset); }

  convertToDate(dateString: string): Date { return this.service.convertToDate(dateString); }

  showAlert(): void { this.service.showAlert(); }

  openUploadDialog(): void {
    this.dialog.open(UploadDialogComponent, {
      width: '600px',
      data: { assetCategory: this.assetCategory, assetTypes: this.assetTypes },
    });

  }

  async onSubmit(): Promise<void> {
    try {
      await this.ap.postData('AssetDetails', this.asset.value);
      // console.log(response);
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan', sans-serif; font-weight: 700; color: green;">บันทึกเสร็จสิ้น</span></h1>`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'OK',
      }).then((result) => {
        // หลังจากที่บันทึกข้อมูลเสร็จสิ้น ให้เรียกเมธอดเพื่ออัปเดตข้อมูล
        this.loadAllData();
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

  autoInput() {
    this.asset.get('quantity')?.setValue(1); //เซคจำนวน
    this.asset.get('CalculatedPrice')?.setValue(this.asset.get('purchasePrice')?.value); //เซคราคาคำนวณ
    this.asset.get('DepreciationCalculationStartDate')?.setValue(this.asset.get('ReceiptDate')?.value);
    this.asset.get('DepreciationStartDate')?.setValue(this.asset.get('ReceiptDate')?.value);

    const assetTypesControlValue = this.asset.get('assetType')?.value;
    if (assetTypesControlValue) {

      const matchingAssetType = this.assetTypes.find(asset => asset.assetCode === assetTypesControlValue);

      if (matchingAssetType) {
        const depreciationRateControl = this.asset.get('DepreciationRate');

        if (depreciationRateControl) {
          depreciationRateControl.setValue(matchingAssetType.rate_dep);
        }
      }
    }


    if (this.userinfo.Affiliation === 'ส่วนกลาง') {
      this.asset.get('departmentId')?.setValue(`${this.userinfo?.DepartmentId}`); //เซตสังกัด หรือ สำนัก
      this.asset.get('factionId')?.setValue(`${this.userinfo?.FactionId}`); //เซตฝ่าย
    } else {
      // this.asset.get('agen')
    }

    const assetCodeInput = this.asset.get('assetCode');

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

  private filterAssetCategories(): void {
    const searchValue = this.assetCategoryFilterCtrl.value;
    this.filterService.filterAssetCategories(this.assetCategory, searchValue).subscribe((filtered) => {
      this.filteredAssetCategories.next(filtered); // Emit the filtered data
    });
  }

  private filterUnits(): void {
    const searchValue = this.unitFilterCtrl.value?.toLowerCase() || '';
    const filtered = this.countingUnits.filter((unit) =>
      unit.Unitname.toLowerCase().includes(searchValue)
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
    this.asset.patchValue({ factionId: event.value }); // Update form control value
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
    console.log('Selected value:', event.value);
    // console.log('MatSelect source:', event.source); 
    this.asset.patchValue({ unit: event.value }); // Update form control value
  }

  enableCustomInput(): void { this.isCustomInput = true; this.selectedFaction = null; }
  disableCustomInput(): void { this.isCustomInput = false; this.asset.patchValue({ assetLocation: '' }); }

}
