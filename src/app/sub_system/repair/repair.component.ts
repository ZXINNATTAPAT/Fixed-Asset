import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {ReactiveFormsModule,FormsModule,FormControl,} from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule,MatPaginator } from '@angular/material/paginator';
import {FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective,TextColorDirective,TableModule,UtilitiesModule} from '@coreui/angular';
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { filter, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from '../../../ApiController/api-service.service';

interface AssetDetails {
  RepairAssetId: any;
  assetCode: string;
  assetName: string;
  assetId: string;
  SerialNumber: string;
  Description: string;
  Amount: string;
}
@Component({
  selector: 'app-repair',
  standalone: true,
  imports: [
    TextColorDirective,
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
    FormControlDirective,
  ],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss',
})
export class RepairComponent implements OnInit, OnDestroy {

  constructor(private http: HttpClient, private ap: ApiService) { }

  assetCode: string = ''; //for input
  
  assetDetails: AssetDetails[] = [];

  assetDetails2: any[] = [];

  assetDetailsset: any[] = [];
  
  asset: any = {AssetName:""};

  dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  searchTerm: string = '';
  isFormVisible = false; // เริ่มต้นซ่อนฟอร์ม

  icons = { cilPencil, cilTrash, cilMagnifyingGlass };

  displayedColumns2: string[] = [
    'รหัสครุภัณฑ์',
    'รายการครุภัณฑ์',
    'เลขที่เอกสาร',
    'รายละเอียด',
    'จำนวนเงิน',
  ];

  assetDataCtrl: FormControl = new FormControl();

  assetdataFilterCtrl: FormControl = new FormControl('');

  filteredAssetData: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  _onDestroy = new Subject<void>();

  ngOnInit(): void {

    this.getAssetdata();
    // Listen for search field value changes
    this.assetdataFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterAsset();
      });
      
    this.setInitialValue();
    // console.log(this.asset);
  }
  
  onSearch(): void {

    // ใช้ searchTerm เก็บค่าจาก input
    const search = this.searchTerm.trim(); 
    
    if (!search) {
      // ถ้าไม่มีคำค้นหา แสดงข้อมูลทั้งหมด
      this.filteredAssetData.next(this.assetDetails2.slice());
      return;
    }
  
    // เรียก API พร้อมส่งคำค้นหา
    this.ap.fetchDatahttp(`AssetDetails?search=${'กกต ' + search}`).subscribe((data) => {
      const assets = data.map((asset: any) => ({
        AssetId: asset.AssetId,
        AssetCode: asset.AssetCode,
        AssetName: asset.AssetName, //เพิ่มมูลค่าสินทรัพย์ วันที่ ได้มา bookvalue 
      }));
  
      // อัปเดตตัวเลือกที่กรองแล้ว
      this.filteredAssetData.next(assets);

      this.asset = assets[0];//เซตค่าที่ได้ไว้ก่อน
      
      console.log(assets);

      // กรณีไม่พบข้อมูล
      if (assets.length === 0) {
        console.warn('ไม่พบข้อมูลที่ตรงกับคำค้นหา');
      }
    });
  }

  filterAsset(): void {
    let search = this.assetdataFilterCtrl.value;
    if (!search) {
      this.filteredAssetData.next(this.assetDetails2.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredAssetData.next(
      this.assetDetails2.filter(
        (asset: { assetCode: string }) =>
          asset.assetCode.toLowerCase().indexOf(search) > -1
      )
    );
  }

  updateAssetName(assetId: string): void {
    this.filteredAssetData.subscribe((data) => {
      const selectedAsset = data.find((item: { assetId: string }) => item.assetId === assetId);
      this.asset.assetName = selectedAsset ? selectedAsset.assetName : '';
    });
  }

  setInitialValue(): void {
    this.filteredAssetData
      .pipe(
        take(1),
        takeUntil(this._onDestroy),
        filter(() => !!this.singleSelect) // ตรวจสอบว่า singleSelect มีค่าก่อน
      )
      .subscribe(() => {
        console.log("Setting compareWith", this.singleSelect); // Debug ดูค่า singleSelect
        this.singleSelect.compareWith = (a: any, b: any) =>
          a && b && a.assetCode === b.assetCode;
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onSubmit() {
      this.http
        .post<any>('https://localhost:7204/api/RepairAsset/', this.asset)
        .subscribe(
          (response) => {

            const newAsset = response;

            this.assetDetails.push(this.translateToThai(newAsset));

            this.dataSource.data = this.assetDetails;

            this.getAssetType();

            // อัปเดตสถานะเป็น "ซ่อมแซม" หลังจากบันทึกสำเร็จ
            // this.updateAssetStatus(newAsset.assetId, 'ซ่อมแซม');
  
            Swal.fire({
              title: 'บันทึกเสร็จสิ้น',
              icon: 'success',
            });
          },
          (error) => {
            console.error(error);
            Swal.fire({
              title: 'มีข้อมูลในระบบอยู่แล้ว',
              icon: 'error',
            });
          }
        );
  }

  // ฟังก์ชันสำหรับอัปเดตสถานะของสินทรัพย์
  // updateAssetStatus(assetId: number, status: string) {
  //   const url = `https://localhost:7204/api/AssetTransferLog/${assetId}/status`;
  //   this.http.patch(url, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })
  //     .subscribe(
  //       () => {
  //         console.log('Status updated successfully');
  //       },
  //       (error) => {
  //         console.error('Error updating status', error);
  //       }
  //     );
  // }

  getAssetType(): void {
    this.http
      .get<any[]>('https://localhost:7204/api/RepairAsset')
      .subscribe((data) => {
        this.assetDetails = data.map((asset) => {
          const foundAsset = this.assetDetails2.find(
            (asset2) => asset2.assetId === asset.assetId

          );
          if (foundAsset) {
            asset.assetCode = foundAsset.assetCode; // เพิ่ม property assetCode เข้าไปในข้อมูล asset
            asset.assetName = foundAsset.assetName;
          } else {
            console.log('Asset code not found for assetId:', asset.assetId);
          }
          asset = this.translateToThai(asset); // แปลงข้อมูลเป็นภาษาไทย
          return asset;
        });

        this.assetDetailsset = this.assetDetails;

        this.dataSource = new MatTableDataSource<any>(this.assetDetailsset);

        this.dataSource.paginator = this.paginator;

        this.dataSource.sort = this.sort;
      });
  }

  getAssetdata(): void {
    this.ap
      .fetchDatahttp('AssetDetails')
      .subscribe((data) => {
        this.assetDetails2 = data.map((asset: { assetId: any; assetCode: any; assetName: any; }) => {
          return {
            assetId: asset.assetId,
            assetCode: asset.assetCode,
            assetName: asset.assetName,
          };
        });

        // อัปเดตค่าใน filteredAssetData ซึ่งเป็นตัวกรองข้อมูลสำหรับ dropdown ที่ใช้ในการเลือก asset
        this.filteredAssetData.next(this.assetDetails2.slice());

        // เรียกฟังก์ชัน getAssetType() เพื่อดึงข้อมูล asset ที่มีอยู่แล้วและปรับปรุง
        this.getAssetType();

      });
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      AssetId: 'assetId',
      AssetCode: 'รหัสครุภัณฑ์',
      AssetName: 'รายการครุภัณฑ์',
      SerialNumber: 'เลขที่เอกสาร',
      Description: 'รายละเอียด',
      Amount: 'จำนวนเงิน',
    };
    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  async deleteAsset(asset: any): Promise<void> {
    if (!asset || !asset.RepairAssetId) {
      await Swal.fire('ข้อผิดพลาด!', 'ไม่พบสินทรัพย์ที่ต้องการลบ', 'error');
      return;
    }
  
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ไม่',
    });
  
    if (!result.isConfirmed) {
      await Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณปลอดภัย :)', 'info');
      return;
    }
  
    try {
      // ใช้ lastValueFrom() เพื่อแปลง Observable เป็น Promise
      await this.ap.deleteData(`RepairAsset/${asset.RepairAssetId}`);
  
      // ลบข้อมูลออกจาก array และอัปเดต dataSource
      this.assetDetails = this.assetDetails.filter(a => a.RepairAssetId !== asset.RepairAssetId);
      this.dataSource.data = [...this.assetDetails]; // Refresh dataSource
  
      await Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
      await Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์', 'error');
    }
  }

  editAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }
}
