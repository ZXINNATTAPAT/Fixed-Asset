import { Component, ElementRef, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatCommonModule, MatNativeDateModule, MatOption } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, FormArray } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel, MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions, } from '@angular/material/form-field';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MomentDateModule, provideMomentDateAdapter, } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput } from '@angular/material/datepicker';
import { FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DataService } from '../../../data-service/data-service.component';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { UploadDialogComponent } from './Dialog/upload-dialog/upload-dialog.component';
import { AssetCodeService } from './Service/asset-code.service';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import 'moment/locale/th.js';
import { FormService } from './Service/form.service';
import { SubAssetService } from './Service/sub-asset.service';
import { DepreciationScheduleService } from './Service/depreciation-schedule.service';
import { DepreciationPreviewComponent } from './components/depreciation-preview.component';
import { SubAssetFormComponent } from './components/sub-asset-form.component';

const formFieldOptions: MatFormFieldDefaultOptions = {
  hideRequiredMarker: true,
  // Optional: hide the required marker (*) globally
};

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
    UploadDialogComponent,DepreciationPreviewComponent, 
    SubAssetFormComponent,
    MomentDateModule, MatNativeDateModule, MatDatepicker, MatDatepickerToggle,
    MatLabel, MatDatepickerInput, MatFormFieldModule, MatInputModule,
    MatFormFieldModule, MatSelect, MatOption, MatFormField,
    FormsModule, FormDirective, FormLabelDirective, FormControlDirective,
    CommonModule, ReactiveFormsModule, NgxMatSelectSearchModule,
    ButtonDirective, NgStyle, NgIf,MatDialogModule,
    MatDialogActions,
    MatDialogContent,
    MatButtonModule,
    MatCommonModule
  ],
})
export class SystemComponent implements OnInit, OnDestroy {

  assetDetails: any[] = [];

  @ViewChild('assetTypeselect') assetTypeSelect!: ElementRef;

  asset!: FormGroup;

  userinfo: any = {};

  assetTypes: any[] = [];

  assetCategory: any[] = [];

  departments: any[] = [];

  depreciationSchedule: any[] = [];

  unit: any[] = [];

  unitCtrl = new FormControl();
  unitFilterCtrl = new FormControl();
  DepartmentFilterCtrl = new FormControl();
  factionsFilterCtrl = new FormControl();
  assetCategoryFilterCtrl = new FormControl();

  filteredUnits = new BehaviorSubject<any[]>([]);
  filteredFactions = new BehaviorSubject<any[]>([]);
  filteredDepartment = new BehaviorSubject<any[]>([]);
  filteredAssetCategories = new BehaviorSubject<any[]>([]);

  showForm = false;
  hidden2 = true;
  options = Array.from({ length: 25 }, (_, i) => i + 1);
  selectedFaction: string | null = null;
  displayDate = '';

  generatedCodes: string[] = [];


  private _onDestroy = new Subject<void>();

  constructor(
    private formService: FormService,
    private subAssetService: SubAssetService,
    private depreciationScheduleService: DepreciationScheduleService,
    private assetCodeService: AssetCodeService,
    private api: ApiService,
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataService.userInfo$.subscribe(user => {
      this.userinfo = user;
      this.asset = this.formService.createAssetForm(this.userinfo.userId);
      this.formService.autoInputFields(this.asset, this.userinfo, this.assetTypes);
      this.setupFormListeners();
      this.loadInitialData();
    });
  }

  get subAssets(): FormArray {return this.asset.get('SubAssets') as FormArray;}

  // generateAssetCode(): void {
  //   this.formService.generateAssetCode(
  //     this.asset,
  //     this.assetCategory,
  //     this.assetDetails,
  //     this.api,
  //     () => this.showAlert(),
  //     (msg) => this.showError(msg),
  //     () => console.log('Asset code generated & validated ✅')
  //   );
  // }

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

    this.api.assetService.generateAssetCode(payload).subscribe({
      next: (response) => {
        if (response && response.assetCode) {
          const code = this.handleGeneratedAssetCode(response.assetCode, year.toString());
          this.asset.patchValue({ AssetCode: code });
          this.validateAssetCode(code);
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

  private async generateMultipleAssetCodes(): Promise<void> {
    const category = this.assetCategory.find(
      (type) => type.CategoryId === this.asset.get('CategoryId')?.value
    );
    const purchaseDate = this.asset.get('PurchaseDate')?.value;
    const year = purchaseDate ? new Date(purchaseDate).getFullYear() + 543 : '';
    const copies = this.asset.get('numberOfCopies')?.value || 1;
  
    if (!category || !year) return;
  
    const payload = {
      Affiliation: 'กกต',
      AssetCategory: category.CategoryCode,
      Year: year.toString(),
      Copies: copies
    };
  
    this.api.assetService.postData('AssetDetails/generate-multiple-codes', payload)
      .then((res: any) => {
        if (res?.assetCodes?.length) {
          this.generatedCodes = res.assetCodes; // ✅ ต้องมีบรรทัดนี้!!
          this.asset.patchValue({ AssetCode: this.generatedCodes[0] });
          this.validateAssetCode(this.generatedCodes[0]);
        }
      })
      .catch(() => {
        this.showError('ไม่สามารถสร้างรหัสได้');
      });
  }
  
  private handleGeneratedAssetCode(generatedCode: string, year: string): string {
    const base = generatedCode.split('-')[0];
    let suffix = 1;
    let finalCode = generatedCode;

    while (this.assetDetails.some(asset => asset.AssetCode === `${base}-${suffix}-${year}`)) {
      suffix++;
    }

    if (suffix > 1) {
      finalCode = `${base}-${suffix}-${year}`;
    }

    return finalCode;
  }

  private validateAssetCode(code: string): void {
    const isDuplicate = this.assetDetails.some(asset => asset.AssetCode === code);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: isDuplicate ? 'error' : 'success',
      html: `<span style="font-family: 'Anuphan'; font-weight: 700; color: ${isDuplicate ? 'red' : 'green'};">
        ${isDuplicate ? 'รหัสครุภัณฑ์ซ้ำ' : 'รหัสครุภัณฑ์ใช้ได้'}
      </span>`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
  
    try {
      if (!this.userinfo?.userId) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');

      const copies = this.asset.get("numberOfCopies")?.value || 0;
      
      if (copies <= 0) throw new Error('จำนวนที่ต้องการสร้างต้องมากกว่า 0');
  
      const payload = { ...this.asset.value, CreatedBy: this.userinfo.userId };
  
      if (this.generatedCodes.length < copies) {
        throw new Error('ยังไม่ได้สร้างรหัสเพียงพอ กรุณาเลือกวันที่ซื้อและจำนวนใหม่');
      }
  
      const dataToSend: any[] = [];
      for (let i = 0; i < copies; i++) {
        dataToSend.push({
          ...payload,
          AssetCode: this.generatedCodes[i],
          uniqueKey: `${payload.AssetName}-${i + 1}`
        });
      }
      console.log('Data to send:', dataToSend);
      await this.api.assetService.postData('AssetDetails', dataToSend);
  
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan'; font-weight: 600; color: green;">บันทึกเสร็จสิ้น</span></h1>`,
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        this.asset.reset();
        this.generatedCodes = [];
        this.assetCategoryFilterCtrl.reset();
      });
  
    } catch (error: any) {
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan'; font-weight: 600; color: red;">${error.message || 'เกิดข้อผิดพลาด'}</span></h1>`,
        icon: 'error',
      });
    }
  }

  private setupFormListeners(): void {
    this.asset.get('PurchasePrice')?.valueChanges.subscribe(() => {
      this.formService.syncCalculatedPrice(this.asset);
    });

    this.asset.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(values => {
      const { TypeId, ReceiptDate, PurchasePrice } = values;
      if (TypeId && ReceiptDate && PurchasePrice > 0) {
        this.api.assetService.fetchDataById('Depreciations/type', TypeId).subscribe(deps => {
          const schedule = this.depreciationScheduleService.calculateSchedule(PurchasePrice, deps[0].Rate_dep, ReceiptDate);
          const summary = this.depreciationScheduleService.extractFirstYearSummary(schedule);
          this.asset.patchValue({
            DepreciationRate: deps[0].Rate_dep,
            AssetAge: deps[0].Servicelife,
            DepreciationValue: summary.depreciation,
            AccumulatedDepreciation: summary.accumulatedDepreciation,
            BookValue: summary.bookValue
          });
          this.depreciationSchedule = schedule;
        });
      }
    });

    this.asset.get('TypeId')?.valueChanges.subscribe((typeId) => {
      if (typeId) {
        this.api.assetService.fetchDataById('Assetcategories/by-type', typeId).subscribe((data) => {
          this.assetCategory = data;
          this.filteredAssetCategories.next(data);
          this.asset.get('CategoryId')?.setValue(null);
        });
      }
    });

    this.assetCategoryFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      const search = this.assetCategoryFilterCtrl.value?.toLowerCase() || '';
      const filtered = this.assetCategory.filter(cat =>
        cat.CategoryName.toLowerCase().includes(search) ||
        cat.CategoryCode.toLowerCase().includes(search)
      );
      this.filteredAssetCategories.next(filtered);
    });

    this.DepartmentFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      const search = this.DepartmentFilterCtrl.value?.toLowerCase() || '';
      const filtered = this.departments.filter(dep =>
        dep.Name.toLowerCase().includes(search) ||
        dep.Semin.toLowerCase().includes(search)
      );
      this.filteredDepartment.next(filtered);
    });

    this.factionsFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      const search = this.factionsFilterCtrl.value?.toLowerCase() || '';
      const filtered = this.filteredFactions.value.filter(fac =>
        fac.Name.toLowerCase().includes(search) ||
        fac.Semin.toLowerCase().includes(search)
      );
      this.filteredFactions.next(filtered);
    });

    this.unitFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      const search = this.unitFilterCtrl.value?.toLowerCase() || '';
      const filtered = this.unit.filter(unit =>
        unit.word.toLowerCase().includes(search)
      );
      this.filteredUnits.next(filtered);
    });

    this.asset.get('numberOfCopies')?.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.generateMultipleAssetCodes(); // ✅ generate ใหม่เมื่อจำนวนเปลี่ยน
    });

  }
  
  private loadInitialData(): void {
    this.api.assetService.fetchData('Assettype').subscribe(types => this.assetTypes = types);
    this.api.assetService.fetchData('Assetcategories').subscribe(cats => this.assetCategory = cats);
    this.api.assetService.fetchData('Departments').subscribe((data: any) => {
      this.departments = data || [];
      this.filteredDepartment.next(this.departments);
    });
    this.api.assetService.fetchData('Assetcategories').subscribe(cats => {
      this.assetCategory = cats;
      this.filteredAssetCategories.next(cats);
    });
    const resourceId = '5b2605ca-cd5c-4034-bc35-3c681c6fedaa';

    this.api.externalDataService.getData(resourceId).pipe(
      catchError(() => {
        console.error('Error fetching countingUnits. Defaulting to empty array.');
        return of([]);
      })
    ).subscribe(
      (response) => {
        if (response?.result?.records) {
          this.unit = response.result.records.map((unit: any) => ({
            word: unit.ลักษณนาม
          }));
          this.filteredUnits.next(this.unit.slice());
        } else {
          console.warn('No records found for Countingunits.');
        }
      },
      (error) => {
        console.error('Error fetching countingUnits:', error);
      }
    );
  }

  openUploadDialog(): void {
    this.dialog.open(UploadDialogComponent, {
      width: '1000px',
      data: {
        userId: Number(this.userinfo.userId), // ✅ ตรงกับที่อ่านด้านใน
        departments: this.departments,
        assetCategory: this.assetCategory,
        assetTypes: this.assetTypes,
      },
    });
  }

  addSubAsset(): void {
    const responsible = this.asset.get('ResponsibleEmployee')?.value || '';
    const assetCode = this.asset.get('AssetCode')?.value || '';
    this.subAssetService.addSubAsset(this.asset, this.assetTypes, assetCode, responsible);
  }

  onDepartmentChange(event: any): void {
    const selectedDeptId = event.value;
    const department = this.departments.find((dept: any) => dept.DeptId === selectedDeptId);
    this.filteredFactions.next(department ? department.Factions || [] : []);
  }

  autoInput(): void {this.formService.autoInputFields(this.asset, this.userinfo, this.assetTypes);}

  onDateChange(event: any): void {this.displayDate = this.formService.onReceiptDateChange(event, this.asset);}

  onDateChange2(event: any): void {
    this.formService.onPurchaseDateChange(event, this.asset);
    this.generateAssetCode();
    // this.generateMultipleAssetCodes(); // ✅
  }
  
  showAlert(): void {Swal.fire({icon: 'info',title: 'กรุณาเลือกประเภทครุภัณฑ์ก่อน',toast: true,position: 'top-end',showConfirmButton: false,timer: 2500});}

  getSubAssetForm(index: number): FormGroup {return this.subAssets.at(index) as FormGroup;}

  removeSubAsset = (index: number): void => {this.subAssetService.removeSubAsset(this.asset, index);};
  
  private showError(message: string): void {Swal.fire({icon: 'error',title: 'เกิดข้อผิดพลาด',text: message,});}
  
  onUnitChange(event: any): void {this.asset.patchValue({ Unit: event.value });}
  
  onFactionChange(event: any): void {this.asset.patchValue({ FactionId: event.value });}
  
  toggleForm(): void {this.showForm = !this.showForm;}
  
  handleInput(event: Event): void {this.formService.handleAssetCodeInput(event, this.asset);}
  
  handleKeyDown(event: KeyboardEvent): void {this.formService.preventEditingFixedPart(event);} 

  handleKeyPress(event: KeyboardEvent, nextInputId: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  }
  
  ngOnDestroy(): void {this._onDestroy.next();this._onDestroy.complete();}
}
