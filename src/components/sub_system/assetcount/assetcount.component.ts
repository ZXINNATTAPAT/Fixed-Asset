import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, InputGroupComponent, BorderDirective, RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import Swal from 'sweetalert2';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput, } from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule, MatLabel, } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import 'moment/locale/th.js';
import { IconDirective } from '@coreui/icons-angular';
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash, } from '@coreui/icons';
import { ReplaySubject, Subject, Subscription, take, takeUntil, firstValueFrom, BehaviorSubject } from 'rxjs';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../data-service/data-service.component';
import { HttpClient } from '@angular/common/http';
import { QrScannerDialogComponent } from './Dialog/qr-scanner-dialog.component';
import { AssetInventoryComponent } from './asset-inventory/asset-inventory.component'

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
    MatSelectModule,

    // BarcodeFormat,

    ReactiveFormsModule,
    FormsModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ZXingScannerModule,
    ButtonDirective,
    NgStyle,
    IconDirective,
  ],
  templateUrl: './assetcount.component.html',
  styleUrl: './assetcount.component.scss',
})

export class AssetcountComponent implements OnInit, OnDestroy {
  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };
  displayedColumns3: string[] = ['รหัสครุภัณฑ์', 'รายการ'];

  userinfo: any = {};
  assetData: any[] = [];

  // ฟิลด์ตัวกรองสำหรับ ngx-mat-select-search
  factionsFilterCtrl = new FormControl();
  DepartmentFilterCtrl = new FormControl();

  // รายการที่กรองแล้ว (ใช้กับ ngx-mat-select-search)
  filteredFactions = new BehaviorSubject<any[]>([]);
  filteredDepartment = new BehaviorSubject<any[]>([]);

  departments: any[] = [];
  factions: any[] = [];

  inspectors: any[] = [];

  filteredAssetData: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  _onDestroy = new Subject<void>();

  assetForm!: FormGroup;
  formArray!: FormArray;
  searchTerm: string = '';

  searchTerms: string[] = [];  // 🔍 ใช้เก็บค่าค้นหาแต่ละแถว
  assetNames: string[] = [];   // 📋 ใช้เก็บชื่อครุภัณฑ์แต่ละแถว

  verifiers: any[] = []; // ✅ เพิ่มตัวแปร verifiers

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  @ViewChild(MatSort) sort!: MatSort;

  availableDevices: MediaDeviceInfo[] = [];
  
  selectedDevice: MediaDeviceInfo | undefined;

  isMobile: boolean = false;
  showMobileScanner: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private ap: ApiService,
    private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.initForm();
    this.loadDepartments();
    this.loadInspectors();
    this.getAvailableDevices(); // ✅ เพิ่ม
  }

  private getAvailableDevices(): void {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop()); // ปิด stream ทันที
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(devices => {
        this.availableDevices = devices.filter(d => d.kind === 'videoinput');
        if(this.isMobile){
          this.selectedDevice = this.availableDevices[1]; 
        }
        else{
          this.selectedDevice = this.availableDevices[0];
        }
        
        console.log('📷 กล้องใน AssetcountComponent:', this.availableDevices);
      })
      .catch(err => {
        console.error('❌ ไม่สามารถดึงกล้องใน assetcount ได้:', err);
      });
  }

  /** ตั้งค่า Form */
  private initForm() {
    this.assetForm = this.fb.group({
      sessionName: ['', Validators.required], // ชื่อรอบตรวจนับ
      date: [new Date().toISOString()], // วันที่ตรวจนับ
      DepartmentId: ['', Validators.required], // สำนัก
      FactionId: ['', Validators.required], // สำนัก
      verifierId: ['', Validators.required], // ผู้ตรวจสอบหลัก
      inspectors: this.fb.array([]), // รายชื่อผู้ตรวจสอบ
      formArray: this.fb.array([]), // รายละเอียดครุภัณฑ์
      note: [''], // หมายเหตุ
      search: ['']
    });
    this.formArray = this.assetForm.get('formArray') as FormArray;
    this.addForm(); // เพิ่มรายการแรก
  }

  /** โหลดข้อมูลผู้ตรวจสอบ */
  private async loadInspectors() {
    try {
      this.ap.assetService.fetchData('users?role=Inspector').subscribe(inspectors => {
        this.inspectors = inspectors || [];
      });
    } catch (error) {
      console.error('Error loading inspectors:', error);
    }
  }

  /** โหลดข้อมูลครุภัณฑ์ */
  private async loadAssets() {
    try {
      this.assetData = await firstValueFrom(this.http.get<any[]>('assets')) || [];
      this.filteredAssetData.next(this.assetData);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }

  /** โหลดข้อมูลสำนัก */
  private async loadDepartments() {
    try {
      this.ap.assetService.fetchData('departments').subscribe((departments: any[]) => {
        // 🔹 แยกฝ่าย (Factions) ออกจาก Departments
        this.departments = departments.map((dept: any) => ({
          DeptId: dept.DeptId,
          Semin: dept.Semin,
          Name: dept.Name,
          factions: dept.Factions || [] // ถ้าไม่มี ให้เป็น array ว่าง
        }));

        // 🔹 กำหนดค่าให้ filteredDepartment เพื่อแสดงใน dropdown
        this.filteredDepartment.next(this.departments);
      });
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  /** เมื่อเลือก `Department` ให้กรอง `Faction` อัตโนมัติ */
  onDepartmentChange(event: any) {
    const selectedDeptId = event.value;
    this.assetForm.patchValue({ DepartmentId: selectedDeptId });

    // กรองฝ่ายที่เกี่ยวข้องกับหน่วยงานที่เลือก
    const selectedDepartment = this.departments.find(dept => dept.DeptId === selectedDeptId);
    this.filteredFactions.next(selectedDepartment ? selectedDepartment.factions : []);
  }

  onFactionChange(event: any) {
    this.assetForm.patchValue({ FactionId: event.value });
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(dept => dept.DeptId === departmentId);
    return department ? department.Name : '-';
  }

  getFactionName(factionId: number): string {
    const faction = this.factions.find(fact => fact.FactId === factionId);
    return faction ? faction.Name : '-';
  }

  /** เพิ่มรายการใหม่ใน FormArray */
  addForm() {
    this.formArray.push(
      this.fb.group({
        search: [''],
        assetId: ['', Validators.required],
        assetName: [''], // ✅ เพิ่ม assetName
        systemQuantity: [1, Validators.required],
        countedQuantity: [1, Validators.required],
        note: [''],
      })
    );
  }

  isFormGroup(control: AbstractControl): control is FormGroup {
    return control instanceof FormGroup;
  }

  get inspectorsArray(): FormArray {
    return this.assetForm.get('inspectors') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    const control = this.formArray.at(index)?.get(controlName) as FormControl;

    if (!control) {
      console.warn(`⚠️ ไม่พบฟอร์มคอนโทรลสำหรับ ${controlName} ที่ index ${index}`);
    }

    return control ?? new FormControl('');
  }

  addInspector() {
    this.inspectorsArray.push(
      this.fb.group({
        inspectorId: [0, Validators.required],
      })
    );
  }

  removeInspector(index: number) {
    if (this.inspectorsArray.length > 0) {
      this.inspectorsArray.removeAt(index);
    }
  }

  /** 🔍 ค้นหาครุภัณฑ์ของแถวที่กำหนด */
  async onSearch(rowIndex: number) {
    const search = this.searchTerms[rowIndex]?.trim();
    if (!search) {
      console.warn(`กรุณากรอกคำค้นหา (แถวที่ ${rowIndex + 1})`);
      return;
    }

    try {
      const data = await firstValueFrom(this.ap.assetService.fetchData(`AssetDetails?search=${encodeURIComponent(search)}`));
      if (data && data.length > 0) {
        const asset = data[0];

        // ✅ อัปเดตข้อมูลใน FormArray
        this.formArray.at(rowIndex).patchValue({
          assetId: asset.AssetId,
          assetName: asset.AssetName,
        });

        // ✅ อัปเดตชื่อครุภัณฑ์ของแถวนั้น
        this.assetNames[rowIndex] = asset.AssetName;
        console.log(`✅ ค้นหาสำเร็จ (แถว ${rowIndex + 1}):`, asset);
      } else {
        this.assetNames[rowIndex] = 'ไม่พบข้อมูล';
        console.warn(`❌ ไม่พบข้อมูลที่ตรงกับคำค้นหา (แถวที่ ${rowIndex + 1})`);
      }
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการค้นหา (แถวที่ ${rowIndex + 1}):`, error);
      this.assetNames[rowIndex] = 'เกิดข้อผิดพลาด';
    }
  }

  private _assetName: string = '';

  get assetName(): string {
    return this._assetName;
  }

  set assetName(value: string) {
    this._assetName = value;
    if (this.formArray.length > 0) {
      this.formArray.at(0).patchValue({ assetName: value });
    }
  }

  /** 🔍 ดึงชื่อครุภัณฑ์จาก assetId */
  getAssetName(assetId: string | number | null | undefined): string {
    if (!assetId) return 'ไม่พบข้อมูล';

    // ✅ แปลงทั้ง assetId และ assetData.assetId เป็น string เพื่อให้ค้นหาเจอ
    const foundAsset = this.assetData?.find((data) => String(data.AssetId) === String(assetId));

    // console.log('✅ พบข้อมูล:', foundAsset);
    return foundAsset?.AssetName ?? 'ไม่พบข้อมูล';
  }

  currentScanIndex: number = 0; // ติดตามแถวที่กำลังสแกน

  /** 📷 เปิด QR Scanner ใน Dialog */
  openQrScanner() {
    const dialogRef = this.dialog.open(QrScannerDialogComponent, {
      width: '500px',
      data: { // 🔹 ส่งค่า availableDevices และ selectedDevice ไปที่ Dialog
        availableDevices: this.availableDevices,
        selectedDevice: this.selectedDevice
      }
    });

    // console.log('this.availableDevices', this.availableDevices);
    // console.log('this.selectedDevice', this.selectedDevice);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onScanSuccess(result, this.currentScanIndex);
      }
    });
  }

 /** 📷 เมื่อสแกน QR Code สำเร็จ */
 onScanSuccess(data: string, rowIndex: number) {
  console.log(`✅ QR Code Data (Row ${rowIndex}):`, data);

  const id = this.extractAssetIdFromUrl(data);
  if (id) {
    this.currentScanIndex = rowIndex; // ระบุแถวที่กำลังจะอัปเดต
    this.fetchAssetById(id);
  } else {
    console.warn('⚠️ Invalid QR Code format');
  }
}


/** 🔍 ฟังก์ชันแยก ID จาก URL */
extractAssetIdFromUrl(url: string): string | null {
  const match = url.match(/\/infoasset\/(\d+)$/); // ✅ ใช้ Regex เพื่อดึง ID
  return match ? match[1] : null;
}

openQrScannerMobile(rowIndex: number) {
  this.currentScanIndex = rowIndex;
  this.showMobileScanner = true;
}

onQrCodeScanned(result: string) {
  this.showMobileScanner = false;
  const id = this.extractAssetIdFromUrl(result);
  if (id) {
    this.fetchAssetById(id);
  } else {
    console.warn('❌ QR Format ไม่ถูกต้อง');
  }
}


/** 🔍 ดึงข้อมูลครุภัณฑ์จาก QR Code */
fetchAssetById(id: string) {
  this.ap.assetService.fetchDataById(`AssetDetails`,id).subscribe({
    next: (assetData) => {
      console.log('✅ Asset Data:', assetData);
      
      if (assetData) {
        // ✅ อัปเดตข้อมูลในแถวที่ถูกต้อง
        this.formArray.at(this.currentScanIndex).patchValue({
          assetId: assetData.AssetId,
          assetName: assetData.AssetName
        });

        // ✅ อัปเดตค่าที่ใช้แสดงใน Input (ตรงกับแถวที่สแกน)
        this.assetNames[this.currentScanIndex] = assetData.AssetName;
        this.searchTerms[this.currentScanIndex] = assetData.AssetCode;

        this.currentScanIndex ++;
      } else {
        console.warn('⚠️ Asset not found');
      }
    },
    error: (error) => {
      console.error('❌ Error fetching asset data:', error);
    }
  });
}

  /** 🔄 ส่งข้อมูลไปยัง API */
  async onSubmit() {

    if (this.assetForm.invalid) {
      console.error('❌ Form is invalid.');
      return;
    }
  
    // ตรวจสอบว่า Inspectors มีค่าหรือไม่
    const inspectors = this.assetForm.get('inspectors')?.value.map((item: any) => ({
      Id: 0, // ✅ ใส่ค่าเริ่มต้นเป็น 0 ถ้าเป็นการสร้างใหม่
      SessionId: 0, // ✅ กำหนดให้ API อัปเดต SessionId อัตโนมัติ
      // AssetInventorySession: null, // ✅ API อาจไม่ต้องการ Object ซ้อน
      InspectorId: Number(item.inspectorId),
    })) || [];
  
    //  ตรวจสอบค่า `InventoryDetails`
    const inventoryDetails = this.formArray.value ? this.formArray.value.map((item: any) => ({
      InventoryDetailId: 0, 
      SessionId: 0, 
      // AssetInventorySession: null,
      AssetId: Number(item.assetId),
      // AssetDetails: null, 
      SystemQuantity: Number(item.systemQuantity),
      CountedQuantity: Number(item.countedQuantity),
      Note: item.note || "",
    })) : [];
  
    // ✅ ตรวจสอบค่า `session`
    const sessionRequest = {
      SessionId: 0, // ✅ ใช้ 0 สำหรับการสร้างใหม่
      Date: this.assetForm.get('date')?.value ,
      SessionName: this.assetForm.get('sessionName')?.value || "ไม่ระบุ",
      DepartmentId: this.assetForm.get('DepartmentId')?.value ? Number(this.assetForm.get('DepartmentId')?.value) : null,
      // Department: null,
      FactionId: this.assetForm.get('FactionId')?.value ? Number(this.assetForm.get('FactionId')?.value) : null,
      // Faction: null,
      VerifierId: this.assetForm.get('verifierId')?.value ? Number(this.assetForm.get('verifierId')?.value) : null,
      // Verifier: null,
      Note: this.assetForm.get('note')?.value || null,
      InventoryDetails: inventoryDetails,
      Inspectors: inspectors
    };
  
    console.log('📤 ส่งข้อมูลไปที่ API:', sessionRequest);
  
    try {
      await this.ap.assetService.postData('AssetInventorySession', sessionRequest);

      Swal.fire({
        icon: 'success',
        title: '✅ บันทึกข้อมูลสำเร็จ!',
        text: 'ข้อมูลถูกบันทึกลงฐานข้อมูลเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        this.assetForm.reset();
      });

    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', error);

      Swal.fire({
        icon: 'error',
        title: '❌ เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง',
        confirmButtonText: 'ตกลง'
      });
    }
  }
  
  /** 🚀 Cleanup */
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  


}

