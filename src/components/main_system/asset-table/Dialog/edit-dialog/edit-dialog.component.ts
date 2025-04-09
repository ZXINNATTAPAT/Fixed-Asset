import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormGroup, FormBuilder, } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { TextColorDirective, TableModule, UtilitiesModule, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
// import { BehaviorSubject, debounceTime, distinctUntilChanged, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input'; // ⬅️ สำหรับ input ที่ใช้ร่วมกับ datepicker
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core'; // ⬅️ สำหรับ date format แบบไทย/สากล
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, provideMomentDateAdapter } from '@angular/material-moment-adapter';


interface AssetDetails {
  repairAssetId: any;
  assetCode: string;
  assetName: string;
  assetId: string;
  SerialNumber: string;
  Description: string;
  Amount: string;
}
@Component({
  selector: 'app-edit-dialog',
  providers: [
    // 👇 ตัวเลือก default ของ mat-form-field (ยังไม่จำเป็นถ้าไม่ได้ปรับ config พิเศษ)
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: MAT_FORM_FIELD_DEFAULT_OPTIONS,
    },

    // ✅ ใช้ MomentDateAdapter + รูปแบบวันที่แบบไทย (พ.ศ.)
    { provide: MAT_DATE_LOCALE, useValue: 'th' },

    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

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

    // ❌ ยังไม่ได้ใช้ — ถ้าไม่ได้ใช้ฟังก์ชัน provideMomentDateAdapter() จากไหน
    // provideMomentDateAdapter({ ... }) 
    // ==> ❌ คอมเมนต์หรือเอาออก
    // ❗ ฟังก์ชันนี้ใช้ได้ในบางกรณีที่มี custom utility แต่ใน Angular Material ปกติไม่ต้องใช้
  ],

  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    // Angular Material
    MatFormFieldModule,
    MatFormField,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatSelect,
    MatOption,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatLabel,

    // CoreUI / Custom UI
    TextColorDirective,
    TableModule,
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,

    // External
    NgxMatSelectSearchModule,
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})

export class EditAssetDialog implements OnInit, OnDestroy, AfterViewInit {
  form!: FormGroup;

  assetTypes: any[] = [];
  assetCategories: any[] = [];
  departments: any[] = [];
  factions: any[] = [];
  statuses: any[] = [];
  assetId:number = 0;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<EditAssetDialog>,
    @Inject(MAT_DIALOG_DATA) public assetData: any
  ) {}

  ngAfterViewInit(): void {}
  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdowns();

    if (this.assetData?.id && !this.assetData.AssetCode) {
      this.assetId = this.assetData.id;
      // 🔁 ดึงข้อมูล Asset ถ้ามีแค่ ID
      this.api.assetService.getAssetById('AssetDetails', this.assetData.id).subscribe({
        next: (res) => this.patchFormWithAsset(res),
        error: (err) => console.error('ไม่สามารถโหลดข้อมูล Asset:', err)
      });
    } else {
      
      this.patchFormWithAsset(this.assetData);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      AssetId: [null],
      AssetCode: ['', Validators.required],
      AssetName: ['', Validators.required],
      Quantity: [1],
      TypeId: [null, Validators.required],
      CategoryId: [null, Validators.required],
      DepartmentId : [null, Validators.required],
      FactionId: [null, Validators.required],
      StatusId: [null, Validators.required],
      ResponsibleEmployee: [''],
      TaxInvoiceNumber: [''],
      PurchaseDate: [''],
      ReceiptDate: [''],
      DepreciationStartDate: [''],
      DepreciationCalculationStartDate: [''],
      PurchasePrice: [0],
      CalculatedPrice: [0],
      ScrapPrice: [0],
      AccumulatedDepreciation: [0],
      DepreciationValue: [0],
      BookValue: [0],
      Note: ['']
    });
  }

  patchFormWithAsset(asset: any): void {
    this.form.patchValue({
      AssetId: asset.AssetId,
      AssetCode: asset.AssetCode,
      AssetName: asset.AssetName,
      Quantity: asset.Quantity,
      TypeId: asset.TypeId,
      CategoryId: asset.CategoryId,
      DepartmentId: asset.DepartmentId,
      FactionId: asset.FactionId,
      StatusId: asset.StatusId,
      ResponsibleEmployee: asset.ResponsibleEmployee,
      TaxInvoiceNumber: asset.TaxInvoiceNumber,
      PurchaseDate: this.formatDate(asset.PurchaseDate),
      ReceiptDate: this.formatDate(asset.ReceiptDate),
      DepreciationStartDate: this.formatDate(asset.DepreciationStartDate),
      DepreciationCalculationStartDate: this.formatDate(asset.DepreciationCalculationStartDate),
      PurchasePrice: asset.PurchasePrice,
      CalculatedPrice: asset.CalculatedPrice,
      ScrapPrice: asset.ScrapPrice,
      AccumulatedDepreciation: asset.AccumulatedDepreciation,
      DepreciationValue: asset.DepreciationValue,
      BookValue: asset.BookValue,
      Note: asset.Note
    });
  }

  formatDate(dateString: string): string {
    return dateString ? dateString.split('T')[0] : '';
  }

  loadDropdowns(): void {
    this.api.assetService.fetchData('Assettype').subscribe(data => this.assetTypes = data);

    this.api.assetService.fetchData('AssetCategories').subscribe(data => this.assetCategories = data);

    this.api.assetService.fetchData('Departments').subscribe(data => this.departments = data);

    this.api.assetService.fetchData('Factiontypecodes').subscribe(data => this.factions = data);

    this.api.assetService.fetchData('Status').subscribe(data => this.statuses = data);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.api.assetService.updateDataById(`AssetDetails`,this.assetId, this.form.value)
        .then(() => {
          alert('บันทึกข้อมูลสำเร็จ!');
          this.dialogRef.close(true);
        })
        .catch(err => {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการอัปเดต');
        });
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

  


