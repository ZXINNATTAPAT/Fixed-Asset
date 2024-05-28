import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  TextColorDirective,
  TableModule,
  UtilitiesModule,
} from '@coreui/angular';
import {
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from 'src/app/api-service.service';

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

  assetCode: string = ''; //for input

  constructor(private http: HttpClient , private ap: ApiService) {}

  assetDetails: AssetDetails[] = [];

  assetDetails2: any[] = [];

  assetDetailsset: any[] = [];

  dataSource: MatTableDataSource<AssetDetails> =
    new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  asset: any = {};
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

  setInitialValue(): void {
    this.filteredAssetData
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // console.log(this.singleSelect);
        this.singleSelect.compareWith = (a: any, b: any) =>
          a && b && a.assetCode === b.assetCode;
      });
  }

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
          Swal.fire({
            title: 'บันทึกเสร็จสิ้น',
            icon: 'success',
          });
        },
        (error) => {
          console.error(error);
          if (error) {
            Swal.fire({
              title: 'มีข้อมูลในระบบอยู่แล้ว',
              icon: 'error',
            });
          }
        }
      );
  }

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

  deleteAsset(asset: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบสินทรัพย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        // ผู้ใช้ยืนยันแล้ว ดำเนินการลบ
        this.http
          .delete(
            `https://localhost:7204/api/RepairAsset/${asset.repairAssetId}`
          )
          .subscribe(
            () => {
              const index = this.assetDetails.findIndex(
                (a) => a.repairAssetId === asset.repairAssetId
              );
              if (index !== -1) {
                this.assetDetails.splice(index, 1);
                // Update the data source after deletion
                this.dataSource.data = this.assetDetails;
              }
              Swal.fire('ลบแล้ว!', 'สินทรัพย์ของคุณถูกลบแล้ว', 'success');
            },
            (error) => {
              console.error('เกิดข้อผิดพลาดในการลบสินทรัพย์:', error);
              Swal.fire(
                'ข้อผิดพลาด!',
                'เกิดข้อผิดพลาดขณะทำการลบสินทรัพย์',
                'error'
              );
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // ผู้ใช้ยกเลิก ไม่ต้องกระทำอะไร
        Swal.fire('ยกเลิกแล้ว', 'สินทรัพย์ของคุณปลอดภัย :)', 'info');
      }
    });
  }

  editAsset(_t35: any) {
    throw new Error('Method not implemented.');
  }
}
