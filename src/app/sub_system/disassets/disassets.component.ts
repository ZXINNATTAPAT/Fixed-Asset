import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule,FormsModule,FormControl, Validators, FormGroup, FormBuilder,} from '@angular/forms';
import { MatPaginator ,MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import {TextColorDirective,TableModule,UtilitiesModule,FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective,} from '@coreui/angular';
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject, debounceTime, distinctUntilChanged, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from '../../../ApiController/api-service.service';
// import { HttpClient } from '@angular/common/http';
// import Swal from 'sweetalert2';

interface AssetDetails {
  repairAssetId: any;
  assetCode: string;
  assetName:string;
  assetId: string;
  SerialNumber: string;
  Description: string;
  Amount: string;
}

@Component({
  selector: 'app-disassets',
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
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,],
  templateUrl: './disassets.component.html',
  styleUrl: './disassets.component.scss'
})

export class DisassetsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  statuses = [{ id: 1, name: 'ขาย' },{ id: 2, name: 'บริจาค' },{ id: 3, name: 'เลิกใช้' } ]; // ตัวอย่างสถานะ
  showForm = false;
  selectedStatusId: number = 0;

  assetDetails2: any[] = [];
  filteredAssetData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  assetdataFilterCtrl: FormControl = new FormControl('');
  searchTerm: string = '';
  private _onDestroy = new Subject<void>();
  mainForm!: FormGroup;
  // assetdataFilterCtrl = { valueChanges: new Subject<string>() };

  icons = { cilPencil, cilTrash, cilMagnifyingGlass };

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns2: string[] = ['รหัสครุภัณฑ์', 'รายการครุภัณฑ์', 'รายละเอียด', 'จำนวนเงิน'];

  asset: any = {
    amount: null, // ค่าเริ่มต้น
    assetId: null,
    assetCode: '',
    assetName: '',
  }; 
  
  constructor(private ap: ApiService,private fb : FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();

    // Listen for search changes with debounce
    this.assetdataFilterCtrl.valueChanges
      .pipe(debounceTime(550), distinctUntilChanged(), takeUntil(this._onDestroy))
      .subscribe((search) => this.filterAsset(search));
  }

  // ✅ ฟังก์ชันกำหนดค่าเริ่มต้นของฟอร์มหลัก
  initializeForm(): void {
    this.mainForm = this.fb.group({
      status: [this.selectedStatusId, Validators.required], // สถานะปัจจุบัน

      // 📌 ฟอร์มสำหรับ "บริจาค"
      donationForm: this.fb.group({
        assetId: ['', Validators.required],
        recipientName: ['', Validators.required],
        contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // ต้องเป็นเบอร์โทร 10 หลัก
        address: ['', Validators.required],
        assetDetails: ['', Validators.required],
        donationDate: ['', Validators.required],
        notes: ['']
      }),

      // 📌 ฟอร์มสำหรับ "เลิกใช้"
      decommissionForm: this.fb.group({
        assetId: ['', Validators.required],
        saleDate: ['', Validators.required],
        description: ['', Validators.required]
      }),

      // 📌 ฟอร์มสำหรับ "ขาย"
      assetSalesForm: this.fb.group({
        assetId: ['', Validators.required],
        purchaseDate: [{ value: '', disabled: true }],
        saleDate: ['', Validators.required],
        sellingprice: ['', [Validators.required, Validators.min(0)]],
        bookValue: [{ value: '', disabled: true }],
        profit: [{ value: '', disabled: true }], // คำนวณอัตโนมัติ
        description: ['', [Validators.maxLength(255)]]
      })
    });

    // คำนวณกำไรอัตโนมัติเมื่อค่าราคาเปลี่ยนแปลง
    this.mainForm.get('assetSalesForm.bookValue')?.valueChanges.subscribe(() => this.calculateProfit());
    this.mainForm.get('assetSalesForm.sellingprice')?.valueChanges.subscribe(() => this.calculateProfit());
  }
  
  onSubmit() {
    if (this.mainForm.invalid) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
  
    const selectedStatus = this.mainForm.value.status;
    let payload: any = { statusId: selectedStatus };
    let apiEndpoint = '';
  
    switch (selectedStatus) {
      case 'donation':
        if (!this.mainForm.get('donationForm')?.valid) {
          alert("กรุณากรอกข้อมูลการบริจาคให้ครบถ้วน");
          return;
        }
        payload = { ...payload, ...this.mainForm.value.donationForm };
        apiEndpoint = 'AssetSharing';
        break;
  
      case 'decommission':
        if (!this.mainForm.get('decommissionForm')?.valid) {
          alert("กรุณากรอกข้อมูลการเลิกใช้ให้ครบถ้วน");
          return;
        }
        payload = { ...payload, ...this.mainForm.value.decommissionForm };
        apiEndpoint = 'AssetDisposal';
        break;
  
      case 'sale':
        if (!this.mainForm.get('assetSalesForm')?.valid) {
          alert("กรุณากรอกข้อมูลการขายให้ครบถ้วน");
          return;
        }
        payload = { ...payload, ...this.mainForm.value.assetSalesForm };
        apiEndpoint = 'AssetSales';
        break;
  
      default:
        alert("กรุณาเลือกสถานะที่ถูกต้อง");
        return;
    }
  
    // 📌 เรียก API เฉพาะตามสถานะที่เลือก
    this.ap.postData(apiEndpoint, payload)
      .then((response) => {
        alert("ข้อมูลถูกบันทึกเรียบร้อย!");
        console.log(response);
        this.mainForm.reset();
      })
      .catch((error) => {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        console.error(error);
      });
  }
  
  // ฟังก์ชันคำนวณกำไร
  calculateProfit(): void {
    const bookValue = this.mainForm.get('assetSalesForm.bookValue')?.value || 0;
    const sellingPrice = this.mainForm.get('assetSalesForm.sellingprice')?.value || 0;
    const profit = sellingPrice - bookValue;
    this.mainForm.get('assetSalesForm.profit')?.setValue(profit);
  }

  onStatusChange(statusId: string): void {
    if (this.selectedStatusId !== +statusId) {
      this.selectedStatusId = +statusId;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAssetdata(): void {
    this.ap.fetchDatahttp('AssetDetails').subscribe((data) => {
      this.assetDetails2 = data.map((asset: any) => ({
        assetId: asset.AssetId,
        assetCode: asset.AssetCode,
        assetName: asset.AssetName,
      }));

      // Update data for dropdown
      this.filteredAssetData.next(this.assetDetails2.slice());
      this.dataSource.data = this.assetDetails2;
    });
  }

  filterAsset(search: string): void {
    if (!search) {
      this.filteredAssetData.next(this.assetDetails2.slice());
      return;
    }

    this.ap.fetchDatahttp(`AssetDetails?search=${search}`).subscribe((data) => {
      const assets = data.map((asset: any) => ({
        assetId: asset.AssetId,
        assetCode: asset.AssetCode,
        assetName: asset.AssetName,
        purchaseDate:asset.PurchaseDate
      }));
      this.filteredAssetData.next(assets);
    });
  }

  onSearch(): void {
    const search = this.searchTerm.trim();
  
    if (!search) {
      this.filteredAssetData.next(this.assetDetails2.slice());
      return;
    }
  
    this.ap.fetchDatahttp(`AssetDetails?search=${'กกต ' + search}`).subscribe((data) => {
      const assets = data.map((asset: any) => ({
        assetId: asset.AssetId,
        assetCode: asset.AssetCode,
        assetName: asset.AssetName,
        purchaseDate: asset.PurchaseDate,
        bookValue: asset.BookValue
      }));
  
      this.filteredAssetData.next(assets);
      console.log(assets);
  
      if (assets.length === 0) {
        console.warn('ไม่พบข้อมูลที่ตรงกับคำค้นหา');
        return;
      }
  
      // 👉 ใส่ค่ารายการแรกลงในฟอร์มที่ใช้งานอยู่
      const selected = assets[0];
      const formattedDate = this.formatDateForInput(selected.purchaseDate);
  
      if (this.selectedStatusId === 1) {
        // 📦 ฟอร์ม "ขาย"
        (this.mainForm.get('assetSalesForm') as FormGroup).patchValue({
          assetId: selected.assetId,
          purchaseDate: formattedDate,
          bookValue: selected.bookValue
        });
      }
  
      if (this.selectedStatusId === 2) {
        // 🙌 ฟอร์ม "บริจาค"
        (this.mainForm.get('donationForm') as FormGroup).patchValue({
          assetId: selected.assetId,
          assetDetails: `${selected.assetCode} - ${selected.assetName}`
        });
      }
    });
  }
  
  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  
  
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      assetId: 'assetId',
      assetCode: 'รหัสครุภัณฑ์',
      assetName: 'รายการครุภัณฑ์',
      serialNumber: 'เลขที่เอกสาร',
      description: 'รายละเอียด',
      amount: 'จำนวนเงิน',
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  editAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }

}
