import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {ReactiveFormsModule,FormsModule,FormControl,} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import {TextColorDirective,TableModule,UtilitiesModule,} from '@coreui/angular';
import {FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective,} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, ReplaySubject} from 'rxjs';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from '../../../../src/app/ApiController/api-service.service';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface AssetDetails {
  repairAssetId: any;
  assetCode: string;
  assetName: string;
  assetId: string;
  SerialNumber: string;
  Description: string;
  Amount: string;
}

interface AssetTransferLog {
  TransferId: number;
  Date: Date;
  ReferenceNumber?: string;
  Note?: string;
  AssetId: number;
  AssetName?: string;
  Quantity: number;
  TransferredFrom?: string;
  TransferredTo?: string;
}

@Component({
  selector: 'app-transferassets',
  standalone: true,
  imports: [TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,

    NgxMatSelectSearchModule,
    MatSelect,
    MatOption,

    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,

    ZXingScannerModule,

    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,],
  templateUrl: './transferassets.component.html',
  styleUrl: './transferassets.component.scss'
})

export class TransferassetsComponent implements OnInit {

  assetTransferForm: FormGroup;
  departments: any[] = [];
  factions: any[] = [];
  filteredDepartments: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredFactions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  departmentFilterCtrl = new FormControl('');
  factionFilterCtrl = new FormControl('');

  constructor(private fb: FormBuilder, private ap: ApiService) {
    this.assetTransferForm = this.fb.group({
      AssetCode: ['', Validators.required],
      AssetId: [0, Validators.required],
      Date: ['', Validators.required],
      DepartmentFrom: [{ value: '', disabled: true }],
      FactionNameFrom: [{ value: '', disabled: true }],
      DepartmentTf: [0, Validators.required],
      FactionNameTf: [0, Validators.required],
      TransferredToFaction: ['', Validators.required],
      Note: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();

    // ฟังการกรอง
    this.departmentFilterCtrl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((search) => {
      this.filterDepartments(search ?? ''); // ใช้ค่าเริ่มต้น '' หาก search เป็น null
    });

  this.factionFilterCtrl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((search) => {
      this.filterFactions(search ?? ''); // ใช้ค่าเริ่มต้น '' หาก search เป็น null
    });

  }

  onSubmit(): void {
    if (this.assetTransferForm.valid) {
      console.log('ข้อมูลที่ส่ง:', this.assetTransferForm.value);
      alert('บันทึกสำเร็จ');
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }

  onUpdateDepartmentAndFaction(): void {
    const assetId = (this.assetTransferForm.get('AssetId')?.value || '').toString().trim();
    const departmentId = (this.assetTransferForm.get('DepartmentTf')?.value || '').toString().trim();
    const factionId = (this.assetTransferForm.get('FactionNameTf')?.value || '').toString().trim();
  
    if (!assetId || !departmentId || !factionId) {
      alert('กรุณาระบุรหัสครุภัณฑ์ หน่วยงาน และฝ่าย');
      return;
    }
  
    // เตรียม Payload สำหรับส่งไปยัง API
    const payload = {
      AssetId: +assetId,
      DepartmentId: +departmentId,
      FactionId: +factionId
    };
  
    // เรียก API PUT เพื่ออัปเดต Department และ Faction
    this.ap.updateData(`AssetDetails/${assetId}/UpdateDepartmentAndFaction`, payload)
    .then(() => {
      alert('อัปเดตข้อมูลสำเร็จ');
    })
    .catch((err) => {
      console.error('Error updating asset details:', err);
  
      // แสดงข้อความข้อผิดพลาดให้ผู้ใช้
      alert(err || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    });
  
  }
  
  onSearch(): void {

    const assetCode = this.assetTransferForm.get('AssetCode')?.value?.trim();

    if (!assetCode) {alert('กรุณาระบุรหัสครุภัณฑ์'); return;}

    // เรียก API ใหม่ GetTransferDetails
    this.ap.fetchDatahttp(`AssetDetails/GetTransferDetails?search=${assetCode}`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const asset = data[0];
          this.assetTransferForm.patchValue({
            AssetId: asset.AssetId,
            DepartmentFrom: `${asset.DepartmentName}`,
            FactionNameFrom:`${asset.FactionName}`
          });
        } else {
          alert('ไม่พบข้อมูลสินทรัพย์');
        }
      },
      error: (err) => {
        console.error('Error fetching asset details:', err);
      }
    });
  }

  loadDepartments(): void {
    this.ap.fetchDatahttp('Departments').subscribe((data: any) => {
      this.departments = data;
      this.filteredDepartments.next(this.departments.slice());
    });
  }

  onDepartmentChange(event: any): void {
    const deptId = event.value;
    const selectedDept = this.departments.find((dept) => dept.DeptId === deptId);
    if (selectedDept) {
      this.factions = selectedDept.Factions || [];
      this.filteredFactions.next(this.factions.slice());
    }
  }

  filterDepartments(search: string): void {
    const filtered = this.departments.filter((department) =>
      department.Name.toLowerCase().includes(search.toLowerCase())
    );
    this.filteredDepartments.next(filtered);
  }
  
  filterFactions(search: string): void {
    const filtered = this.factions.filter((faction) =>
      faction.Name.toLowerCase().includes(search.toLowerCase())
    );
    this.filteredFactions.next(filtered);
  }
  
  
}
