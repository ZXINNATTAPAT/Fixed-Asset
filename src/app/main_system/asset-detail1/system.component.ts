import { Component, ElementRef, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatCommonModule, MatNativeDateModule, MatOption } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel, MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions, } from '@angular/material/form-field';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MomentDateModule, provideMomentDateAdapter, } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput } from '@angular/material/datepicker';
import { FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { cilDataTransferUp } from '@coreui/icons';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { AssetDetails2Component } from '../asset-details2/asset-details2.component';
import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
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
    AssetDetails2Component, AssetDetails3Component, UploadDialogComponent,DepreciationPreviewComponent, SubAssetFormComponent,
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

  get subAssets(): FormArray {
    return this.asset.get('SubAssets') as FormArray;
  }
  

  generateAssetCode(): void {
    this.formService.generateAssetCode(
      this.asset,
      this.assetCategory,
      this.assetDetails,
      this.api,
      () => this.showAlert(),
      (msg) => this.showError(msg),
      () => console.log('Asset code generated & validated ✅')
    );
  }

  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: message,
    });
  }

  autoInput(): void {
    this.formService.autoInputFields(this.asset, this.userinfo, this.assetTypes);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onDateChange(event: any): void {
    this.displayDate = this.formService.onReceiptDateChange(event, this.asset);
  }

  onDateChange2(event: any): void {
    this.formService.onPurchaseDateChange(event, this.asset);
    this.generateAssetCode(); // 👈 เพิ่มบรรทัดนี้
  }
  
  handleInput(event: Event): void {
    this.formService.handleAssetCodeInput(event, this.asset);
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.formService.preventEditingFixedPart(event);
  }

  handleKeyPress(event: KeyboardEvent, nextInputId: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
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
  }

  addSubAsset(): void {
    const responsible = this.asset.get('ResponsibleEmployee')?.value || '';
    const assetCode = this.asset.get('AssetCode')?.value || '';
    this.subAssetService.addSubAsset(this.asset, this.assetTypes, assetCode, responsible);
  }
  
  getSubAssetForm(index: number): FormGroup {
    return this.subAssets.at(index) as FormGroup;
  }
  
  removeSubAsset = (index: number): void => {
    this.subAssetService.removeSubAsset(this.asset, index);
  };
  

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
        departments: this.departments,
        assetCategory: this.assetCategory,
        assetTypes: this.assetTypes,
      },
    });
  }

  showAlert(): void {
    Swal.fire({
      icon: 'info',
      title: 'กรุณาเลือกประเภทครุภัณฑ์ก่อน',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    });
  }

  onUnitChange(event: any): void {
    this.asset.patchValue({ Unit: event.value });
  }

  onFactionChange(event: any): void {
    this.asset.patchValue({ FactionId: event.value });
  }

  onDepartmentChange(event: any): void {
    const selectedDeptId = event.value;
    const department = this.departments.find((dept: any) => dept.DeptId === selectedDeptId);
    this.filteredFactions.next(department ? department.Factions || [] : []);
  }

  async onSubmit(): Promise<void> {
    try {
      if (!this.userinfo || !this.userinfo.userId) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');
      const payload = { ...this.asset.value, CreatedBy: this.userinfo.userId };
      const count = this.asset.get("numberOfCopies")?.value || 1;
      const dataToSend = Array.from({ length: count }, (_, i) => ({
        ...payload,
        uniqueKey: `${payload.assetName}-${i + 1}`
      }));

      await this.api.assetService.postData('AssetDetails', dataToSend);

      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan'; color: green;">บันทึกเสร็จสิ้น</span></h1>`,
        icon: 'success',
        confirmButtonText: 'OK'
      });

      this.asset.reset();
    } catch (error) {
      Swal.fire({
        html: `<h1><span style="font-family: 'Anuphan'; color: red;">กรุณากรอกข้อมูลให้ครบ</span></h1>`,
        icon: 'error'
      });
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
