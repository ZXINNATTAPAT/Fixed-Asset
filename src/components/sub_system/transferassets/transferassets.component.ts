import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TextColorDirective, TableModule, UtilitiesModule, } from '@coreui/angular';
import { FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, ReplaySubject } from 'rxjs';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../data-service/data-service.component';
import { IconSubset } from '../../../app/icons/icon-subset';
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash,cilSearch } from '@coreui/icons';

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
    MatSelect,MatOption,
    MatLabel,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
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
  userinfo: any = [];
  userRoles: string[] = [];

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo ,cilSearch };

  departments: any[] = [];
  factions: any[] = [];
  filteredDepartments: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredFactions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  departmentFilterCtrl = new FormControl('');
  factionFilterCtrl = new FormControl('');

  transferLogs: AssetTransferLog[] = [];
  displayedColumns: string[] = [
    'Aactions',
    // 'no',
    // 'assetId',
    'assetCode',
    'assetName',
    'transferredFrom',
    'transferredTo',
    'date',
    'note'
  ];

  dataSource = new MatTableDataSource<any>();


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(private fb: FormBuilder, private ap: ApiService, private dataService: DataService) {
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
    this.initializeUserInfo()
    this.loadDepartments();
    this.loadTransferLogs(); // โหลดประวัติโอนย้าย

    this.departmentFilterCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search) => this.filterDepartments(search ?? ''));

    this.factionFilterCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search) => this.filterFactions(search ?? ''));
  }


  onTransferAsset(): void {

    const assetId = +this.assetTransferForm.get('AssetId')?.value;

    const departmentFrom = this.assetTransferForm.get('DepartmentTf')?.value?.toString().trim();

    const factionTo = this.assetTransferForm.get('FactionNameTf')?.value?.toString().trim();

    if (!assetId || !departmentFrom || !factionTo) {
      alert('กรุณาระบุรหัสครุภัณฑ์ หน่วยงาน และฝ่าย');
      return;
    }

    const payload = {
      AssetId: assetId,
      TransferredFrom: departmentFrom,
      TransferredTo: factionTo,
      Quantity: 1, // หรือให้เลือกจำนวนจากฟอร์มถ้ามี
      Note: this.assetTransferForm.get('Note')?.value || ''
    };

    this.ap.assetService.postData(`AssetTransferLog/TransferAsset`, payload)
      .then(() => { alert('โอนย้ายสำเร็จ'); })
      .catch((err) => {
        console.error('Error transferring asset:', err);
        alert(err?.message || 'เกิดข้อผิดพลาดในการโอนย้าย');
      });
  }

  onSearch(): void {

    const assetCode = this.assetTransferForm.get('AssetCode')?.value?.trim();

    if (!assetCode) { alert('กรุณาระบุรหัสครุภัณฑ์'); return; }

    // เรียก API ใหม่ GetTransferDetails
    this.ap.assetService.fetchData(`AssetDetails/GetTransferDetails?search=${assetCode}`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const asset = data[0];
          this.assetTransferForm.patchValue({
            AssetId: asset.AssetId,
            DepartmentFrom: `${asset.DepartmentName}`,
            FactionNameFrom: `${asset.FactionName}`
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

  loadTransferLogs(): void {
    this.ap.assetService.fetchData('AssetTransferLog/GetAllTransfers')
      .subscribe((data: any[]) => {
        this.dataSource = new MatTableDataSource<any>(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }


  loadDepartments(): void {
    this.ap.assetService.fetchData('Departments').subscribe((data: any) => {
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

  viewTransfer(transfer: any): void {
    Swal.fire({
      title: 'รายละเอียดการโอนย้าย',
      html: `
        <b>รายการ:</b> ${transfer.AssetName || '-'}<br>
        <b>จาก:</b> ${transfer.TransferredFromName || '-'}<br>
        <b>ไปยัง:</b> ${transfer.TransferredToName || '-'}<br>
        <b>วันที่:</b> ${new Date(transfer.Date).toLocaleDateString()}<br>
        <b>หมายเหตุ:</b> ${transfer.Note || '-'}
      `,
      icon: 'info'
    });
  }

  editTransfer(transfer: any): void {
    // TODO: เปิด dialog หรือ route ไปหน้าแก้ไข
    console.log('แก้ไข:', transfer);
    alert(`(dev) เปิดหน้าฟอร์มแก้ไข Transfer ID: ${transfer.TransferId}`);
  }

  deleteTransfer(transfer: any): void {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: `ต้องการลบการโอน "${transfer.AssetName}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ap.assetService.deleteData(`AssetTransferLog/${transfer.TransferId}`).then(() => {
          Swal.fire('ลบสำเร็จ', '', 'success');
          this.loadTransferLogs(); // reload ตาราง
        });
      }
    });
  }

  isGeneralStaffOnly(): boolean {
    return this.userRoles.includes('เจ้าหน้าที่ทั่วไป') && this.userRoles.length === 1;
  }

  // โหลดข้อมูล UserInfo
  private async initializeUserInfo(): Promise<void> {
    this.dataService.userInfo$.subscribe(userInfo => {
      if (userInfo) {
        this.userinfo = userInfo.claims;
      }
    });

    this.ap.authService.getUserRole().subscribe(res => {
      this.userRoles = res.roles;
    });
  }




}
