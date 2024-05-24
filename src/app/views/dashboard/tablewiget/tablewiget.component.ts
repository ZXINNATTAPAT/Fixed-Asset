import {
  AfterViewInit,
  Component,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
} from '@coreui/angular';
import { CommonModule, DatePipe, NgIf, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
  RowComponent,
  ColComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';

import { HttpClient } from '@angular/common/http';

import {
  cilPencil,
  cilTrash,
  cibAddthis,
  cilDataTransferDown,
  cilInfo,
} from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import {
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatRowDef,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import 'moment/locale/th.js';
import { Subject, Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { DataService } from 'src/app/data-service/data-service.component';

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

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();
  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = $localize`First page`;
  itemsPerPageLabel = $localize`Items per page:`;
  lastPageLabel = $localize`Last page`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return $localize`Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return $localize`Page ${page + 1} of ${amountPages}`;
  }
}

@Component({
  selector: 'app-tablewiget',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,

    MatPaginatorModule,
    MatTableModule,
    MatSort,
    MatPaginator,
    MatFooterRow,
    MatRowDef,
    MatFooterCell,
    MatFooterCellDef,
    MatFooterRowDef,

    ButtonDirective,
    NgStyle,NgIf
  ],
  templateUrl: './tablewiget.component.html',
  styleUrl: './tablewiget.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
})
export class TablewigetComponent implements OnInit, OnDestroy, AfterViewInit {
  userinfo: any = [];
  token: any;

  assetDetails: AssetDetails[] = [];

  displayedColumns2: string[] = [
    'การดำเนินการ',
    'วันเดือนปี',
    'รหัสครุภัณฑ์',
    'รายการ',
    'ราคาต่อหน่วย',
    'วิธีการได้มา',
    'เลขที่เอกสาร',
    'ฝ่าย',
    'ผู้ใช้งาน',
    'หมายเหตุ',
  ];

  dataSource = new MatTableDataSource<AssetDetails>(this.assetDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  displayedColumns: string[] = [
    'purchaseDate',
    'assetCode',
    'assetName',
    'purchasePrice',
    'purchasedFrom',
    'documentNumber',
    'department',
    'responsibleEmployee',
    'note',
  ];

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  // dataSource: MatTableDataSource<AssetDetails> = new MatTableDataSource<AssetDetails>(this.assetDetails);
  private dataSubscription!: Subscription;

  ngOnInit(): void {
    this.getAssetDetails();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
  readinfo() {
    this.token = localStorage.getItem('token');
    const decodedToken = jwtDecode(this.token);
    this.userinfo = decodedToken;
    // console.log(this.userinfo);
  }

  constructor(private http: HttpClient,private dataService :DataService) {
    this.readinfo();
    this.getAssetDetails();
    // this.dataSource = new MatTableDataSource(this.assetDetails);
  }

  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  getAssetDetails(): void {

    if(this.dataService.getAssetDetails()){
      this.dataSubscription = this.dataService.getAssetDetails().subscribe((data: any[]) => {
        this.assetDetails = data
          .filter((asset) => {
            if(this.userinfo.affiliation !== "กกต.สกล"){
              return (
                asset.assetCode.startsWith(this.userinfo.affiliation) &&
                !asset.assetCode.includes(`${this.userinfo.affiliation}.`)
              );
            }
            else{
              return (
                !asset.assetCode.startsWith("กกต." && "กกต") && //กันข้อมูลที่ขึ้นต้นด้วย กกต.สกล + กกต. + กกต 
                asset.agency.startsWith(`${this.userinfo.workgroup}`)
              );
            }
            
          })
          .map((asset) => {
            const date = new Date(asset.purchaseDate);
            if (!isNaN(date.getTime())) {
                const formattedDate = date.toLocaleDateString('th', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
                asset = Object.assign({}, asset, { purchaseDate: formattedDate });
                asset = this.translateToThai(asset);
                return asset;
            } else {
                console.error('Invalid date format:', asset.purchaseDate);
                return null; // หรืออื่น ๆ ตามที่คุณต้องการจัดการ
            }
          });
        // Update the data source with the new asset details
        this.dataSource.data = this.assetDetails;
        // console.log(this.assetDetails)
      });
    }
    else{
      this.dataSubscription = this.http
      .get<any[]>('https://localhost:7204/api/AssetDetails')
      .subscribe((data) => {
        this.assetDetails = data
          .filter((asset) => {
            if(this.userinfo.affiliation !== "กกต.สกล"){
              return (
                asset.assetCode.startsWith(this.userinfo.affiliation) &&
                !asset.assetCode.includes(`${this.userinfo.affiliation}.`)
              );
            }
            else{
              return (
                !asset.assetCode.startsWith("กกต." && "กกต") && //กันข้อมูลที่ขึ้นต้นด้วย กกต.สกล + กกต. + กกต 
                asset.agency.startsWith(`${this.userinfo.workgroup}`)
              );
            }
            
          })
          .map((asset) => {
            asset.purchaseDate = this.convertDate(asset.purchaseDate);
            asset = this.translateToThai(asset);
            return asset;
          });
        // Update the data source with the new asset details
        this.dataSource.data = this.assetDetails;
      });
    }
    
  }

  addasset(): void {
    window.location.href = '#/system/AssetDetails';
  }

  totalPricePerUnit(): number {
    return this.dataSource.data.reduce((acc, curr) => acc +Number(curr['ราคาต่อหน่วย']) , 0);
}

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      purchaseDate: 'วันเดือนปี',
      assetCode: 'รหัสครุภัณฑ์',
      assetName: 'รายการ',
      purchasePrice: 'ราคาต่อหน่วย',
      purchasedFrom: 'วิธีการได้มา',
      documentNumber: 'เลขที่เอกสาร',
      department: 'ฝ่าย',
      responsibleEmployee: 'ผู้ใช้งาน',
      note: 'หมายเหตุ',
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }

  formatCurrency(price: number): string {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
}
