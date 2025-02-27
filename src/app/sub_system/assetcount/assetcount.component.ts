import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TextColorDirective, InputGroupComponent, BorderDirective, } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, FormBuilder, Validators, AbstractControl, } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { ApiService } from '../../ApiController/api-service.service';
import Swal from 'sweetalert2';

import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerInput, } from '@angular/material/datepicker';
import {MatFormField,MatFormFieldModule,MatLabel,} from '@angular/material/form-field';
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
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash, } from '@coreui/icons';
import { ReplaySubject, Subject, Subscription, take, takeUntil, firstValueFrom, BehaviorSubject } from 'rxjs';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../data-service/data-service.component';
import { HttpClient } from '@angular/common/http';


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

  // 🟢 ฟิลด์ตัวกรองสำหรับ ngx-mat-select-search
  factionsFilterCtrl = new FormControl();
  DepartmentFilterCtrl = new FormControl();

  // 🟢 รายการที่กรองแล้ว (ใช้กับ ngx-mat-select-search)
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

  // 🟢 ตั้งค่าการสแกน QR Code
  startScanner = false;
  allowedFormats: BarcodeFormat[] = [BarcodeFormat.QR_CODE]; // รองรับเฉพาะ QR Code
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;

  verifiers: any[] = []; // ✅ เพิ่มตัวแปร verifiers

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  constructor(
    private fb: FormBuilder, 
    private http: HttpClient ,
    private ap : ApiService,
    private cdr : ChangeDetectorRef) 
  {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserInfo();
    this.loadDepartments();
    this.loadInspectors();
    this.loadAssets();
    this.getAvailableDevices();
  }

  /** 🟢 ตั้งค่า Form */
  private initForm() {
    this.assetForm = this.fb.group({
      sessionName: ['', Validators.required], // ชื่อรอบตรวจนับ
      date: [new Date().toISOString()], // วันที่ตรวจนับ
      departmentId: ['', Validators.required], // สำนัก
      factionId: ['', Validators.required], // สำนัก
      verifierId: ['', Validators.required], // ผู้ตรวจสอบหลัก
      inspectors: this.fb.array([]), // รายชื่อผู้ตรวจสอบ
      formArray: this.fb.array([]), // รายละเอียดครุภัณฑ์
      note: [''], // หมายเหตุ
      search: ['']
    });
    this.formArray = this.assetForm.get('formArray') as FormArray;
    this.addForm(); // เพิ่มรายการแรก
  }

  /** โหลดข้อมูลผู้ใช้ */
  private loadUserInfo() {this.userinfo = { affiliation: 'กกต' };}

  /** โหลดข้อมูลผู้ตรวจสอบ */
  private async loadInspectors() {
    try {
      this.ap.fetchDatahttp('users?role=Inspector').subscribe(inspectors => {
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
      this.ap.fetchDatahttp('departments').subscribe((departments: any[]) => {
        // 🔹 แยกฝ่าย (Factions) ออกจาก Departments
        this.departments = departments.map((dept: any) => ({
          DeptId: dept.DeptId,
          Semin:dept.Semin,
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
  getAssetName(assetId: number): string {
    return this.assetData?.find(data => data.assetId === assetId)?.assetName ?? 'ไม่พบข้อมูล';
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(dept => dept.DeptId === departmentId);
    return department ? department.Name : '-';
  }
  
  getFactionName(factionId: number): string {
    const faction = this.factions.find(fact => fact.FactId === factionId);
    return faction ? faction.Name : '-';
  }

  
  /** 🆕 เพิ่มรายการใหม่ใน FormArray */
  addForm() {
    this.formArray.push(
      this.fb.group({
        search: [''],
        assetId: ['', Validators.required],
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
  
  addInspector() {
    this.inspectorsArray.push(
      this.fb.group({
        inspectorId: ['', Validators.required],
      })
    );
  }
  
  removeInspector(index: number) {
    if (this.inspectorsArray.length > 0) {
      this.inspectorsArray.removeAt(index);
    }
  }
  
  /** 🔍 ค้นหาครุภัณฑ์ */
  async onSearch() {
    const search = this.searchTerm.trim();
    if (!search) {
      console.warn('กรุณากรอกคำค้นหา');
      this.filteredAssetData.next([]);
      return;
    }

    try {
      const data = await firstValueFrom(this.ap.fetchDatahttp(`/api/AssetDetails?search=${encodeURIComponent(search)}`));
      this.filteredAssetData.next(data ?? []);
      this.assetData = data || [];

      if (data && data.length > 0) {
        this.formArray.at(0).patchValue({ assetId: data[0].assetId });
      } else {
        console.warn('ไม่พบข้อมูลที่ตรงกับคำค้นหา');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
      this.filteredAssetData.next([]);
    }
  }

  
  

  /** 📷 ดึงข้อมูลกล้องที่สามารถใช้งานได้ */
  getAvailableDevices() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      if (this.availableDevices.length > 0) {
        this.selectedDevice = this.availableDevices[0]; // เลือกกล้องตัวแรกโดยอัตโนมัติ
      }
    }).catch(error => console.error('Error accessing media devices:', error));
  }

  /** 📷 เมื่อสแกน QR Code สำเร็จ */
  onScanSuccess(data: string) {
    this.startScanner = false; // ปิดสแกนเนอร์หลังจากสแกนสำเร็จ
    console.log('QR Code Data:', data);

    const id = this.extractAssetIdFromUrl(data);
    if (id) {
      this.fetchAssetById(id);
    } else {
      console.warn('Invalid QR Code format');
    }
  }

  /** 🔍 ดึงข้อมูลครุภัณฑ์จาก QR Code */
  fetchAssetById(id: string) {
    this.http.get<any>(`/api/AssetDetails/${id}`).subscribe({
      next: (assetData) => {
        console.log('Asset Data:', assetData);
        this.formArray.at(0).patchValue({ assetId: assetData.AssetId });
      },
      error: (error) => {
        console.error('Error fetching asset data:', error);
      }
    });
  }

  /** 🆔 Extract Asset ID from URL */
  private extractAssetIdFromUrl(url: string): string | null {
    const regex = /\/(\d+)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /** 🔄 ส่งข้อมูลไปยัง API */
  async onSubmit() {
    if (this.assetForm.invalid) {
      console.error('Form is invalid.');
      return;
    }
  
    const sessionRequest = {
      sessionName: this.assetForm.get('sessionName')?.value,
      date: this.assetForm.get('date')?.value,
      departmentId: this.assetForm.get('departmentId')?.value,
      factionId: this.assetForm.get('factionId')?.value, // ✅ ส่ง FactionId ด้วย
      verifierId: this.assetForm.get('verifierId')?.value,
      inspectors: this.assetForm.get('inspectors')?.value.map((inspectorId: number) => ({ inspectorId })),
      inventoryDetails: this.formArray.value.map((item: any) => ({
        assetId: item.assetId,
        systemQuantity: item.systemQuantity,
        countedQuantity: item.countedQuantity,
        note: item.note,
      })),
    };
  
    try {
      await firstValueFrom(this.http.post('/api/AssetInventorySession', sessionRequest));
      alert('บันทึกข้อมูลสำเร็จ!');
      this.assetForm.reset();
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  }
  
  /** 🚀 Cleanup */
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

 
}

