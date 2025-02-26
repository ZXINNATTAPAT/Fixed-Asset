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
import { ApiService } from '../../../../ApiController/api-service.service';

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
    selector: 'app-edit-dialog',
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
      MatButtonModule, // Example: Add any other required Angular Material modules here
      UtilitiesModule,
      ButtonDirective,
      NgStyle,
      IconDirective,
      FormDirective,
      FormLabelDirective,
      FormControlDirective,],
    templateUrl: './edit-dialog.component.html',
    styleUrl: './edit-dialog.component.scss'
  })
export class EditAssetDialog implements OnInit, OnDestroy, AfterViewInit {

  
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

  asset: any = {amount: null, // ค่าเริ่มต้น
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

  // ฟังก์ชันคำนวณกำไร
  calculateProfit(): void {
    const bookValue = this.mainForm.get('assetSalesForm.bookValue')?.value || 0;
    const sellingPrice = this.mainForm.get('assetSalesForm.sellingprice')?.value || 0;
    const profit = sellingPrice - bookValue;
    this.mainForm.get('assetSalesForm.profit')?.setValue(profit);
  }

  // ฟังก์ชันส่งฟอร์ม
  submitForm(): void {
    if (this.mainForm.valid) {
      console.log('Form Data:', this.mainForm.value);
      alert('บันทึกข้อมูลสำเร็จ!');
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
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
    const search = this.searchTerm.trim(); // ใช้ searchTerm เก็บค่าจาก input
  
    if (!search) {
      // ถ้าไม่มีคำค้นหา แสดงข้อมูลทั้งหมด
      this.filteredAssetData.next(this.assetDetails2.slice());
      return;
    }
  
    // เรียก API พร้อมส่งคำค้นหา
    this.ap.fetchDatahttp(`AssetDetails?search=${'กกต ' + search}`).subscribe((data) => {
      const assets = data.map((asset: any) => ({
        assetId: asset.AssetId,
        assetCode: asset.AssetCode,
        assetName: asset.AssetName, //เพิ่มมูลค่าสินทรัพย์ วันที่ ได้มา bookvalue 
      }));
  
      // อัปเดตตัวเลือกที่กรองแล้ว
      this.filteredAssetData.next(assets);
      
      console.log(assets);

      // กรณีไม่พบข้อมูล
      if (assets.length === 0) {
        console.warn('ไม่พบข้อมูลที่ตรงกับคำค้นหา');
      }
    });
  }
  
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onSubmit() {
   
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
