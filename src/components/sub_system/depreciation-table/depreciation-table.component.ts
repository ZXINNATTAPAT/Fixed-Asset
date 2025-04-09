import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { IconDirective } from '@coreui/icons-angular';
import { cilInfo, cilPencil, cilSearch, cilTrash } from '@coreui/icons';
import * as ExcelJS from 'exceljs';
import { InfoassetComponent } from '../../main_system/infoasset/infoasset.component';
import { EditAssetDialog } from '../../main_system/asset-table/Dialog/edit-dialog/edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';


@Component({
  selector: 'app-depreciation-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, IconDirective,
    MatSortModule, MatOption, NgxMatSelectSearchModule, ReactiveFormsModule, MatFormField, FormsModule, NgFor ,MatSelect],
  templateUrl: './depreciation-table.component.html',
  styleUrl: './depreciation-table.component.scss'
})
export class DepreciationTableComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();

  categoryCtrl = new FormControl();
  categoryFilterCtrl = new FormControl();
  selectedCategoryId: number | null = null;
  categories: any[] = [];
  filteredCategoryList: any[] = [];
  private originalData: any[] = [];

  selectedAssetType: number | null = null;
  assetTypes: any[] = [];



  displayedColumns: string[] = ['actions',
    'code', 'name', 'price', 'qty', 'amount', 'rate',
    'openingValue', 'depreciation', 'accumulated',
    'netValue', 'received'
  ];
  instan = { icons: { cilPencil, cilTrash, cilInfo, cilSearch } };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private ap: ApiService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.ap.assetService.fetchData('AssetDetails/Depreciations').subscribe(
      data => {
        this.originalData = data;

        this.dataSource.data = [...data].sort((a, b) => {
          const matchA = a.AssetCode?.match(/(\d+)-(\d+)-(\d+)/);
          const matchB = b.AssetCode?.match(/(\d+)-(\d+)-(\d+)/);

          if (!matchA || !matchB) return 0; // ❌ ถ้าไม่ match ก็ไม่ต้องเปรียบเทียบ

          // เรียงจากปีใหม่ก่อน
          const yearA = parseInt(matchA[3], 10);
          const yearB = parseInt(matchB[3], 10);
          if (yearA !== yearB) return yearB - yearA;

          // จากนั้นเรียงตามตัวเลขรหัส
          const numA = parseInt(matchA[1] + matchA[2], 10);
          const numB = parseInt(matchB[1] + matchB[2], 10);
          return numA - numB;
  
        });
        this.dataSource.data = [...this.originalData];
      },
      err => console.error('API error', err)
    );
    this.ap.assetService.fetchData('Assetcategories').subscribe(data => {
      this.categories = data;
      this.filteredCategoryList = data;

      this.categoryFilterCtrl.valueChanges.subscribe(search => {
        const keyword = (search || '').toLowerCase();
        this.filteredCategoryList = this.categories.filter(cat =>
          cat.CategoryName.toLowerCase().includes(keyword)
        );
      });
    });
    this.ap.assetService.fetchData('Assettype').subscribe(types => {
      this.assetTypes = types;
    });

  }

  onAssetTypeChange(): void {
    if (this.selectedAssetType) {
      this.dataSource.data = this.originalData.filter(item => item.TypeId === this.selectedAssetType);
    } else {
      this.dataSource.data = [...this.originalData]; // reset
    }
  }

  filterByCategory(): void {
    const selected = this.selectedCategoryId;
    if (!selected) {
      this.dataSource.filter = ''; // reset
      return;
    }

    this.dataSource.data = this.originalData.filter(item => item.CategoryId === selected);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getAmount(asset: any): number {
    return asset.Quantity * asset.PurchasePrice;
  }

  getDepreciationRate(asset: any): string {
    return asset.DepreciationRate ?? '-';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH');
  }

  editDialog(assetId: number): void {
    const dialogRef = this.dialog.open(EditAssetDialog, {
      width: '1200px',
      data: { id: assetId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('ผลลัพธ์จาก Dialog:', result);
      }
    });
  }

  assetDialog(assetId: number): void {
    const dialogRef = this.dialog.open(InfoassetComponent, {
      width: '1200px',
      data: { id: assetId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('ผลลัพธ์จาก Dialog:', result);
      }
    });
  }

  deleteAsset(asset: any) {
    // ลบ
    if (confirm(`คุณต้องการลบทรัพย์สิน ${asset.AssetCode} ใช่หรือไม่?`)) {
      console.log('ลบ:', asset);
      // เรียก API ลบได้ตรงนี้
    }
  }

  // ฟังก์ชัน Export
  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Depreciation');

    // หัวตาราง
    worksheet.columns = [
      { header: 'รหัส', key: 'AssetCode', width: 20 },
      { header: 'รายการ', key: 'AssetName', width: 30 },
      { header: 'ราคา', key: 'PurchasePrice', width: 15 },
      { header: 'จำนวน', key: 'Quantity', width: 10 },
      { header: 'จำนวนเงิน', key: 'Amount', width: 15 },
      { header: 'อัตราค่าเสื่อม (%)', key: 'DepreciationRate', width: 18 },
      { header: 'มูลค่าทรัพย์สินต้นงวด', key: 'OpeningValue', width: 20 },
      { header: 'ค่าเสื่อมราคาประจำปี', key: 'DepreciationValue', width: 20 },
      { header: 'ค่าเสื่อมสะสม', key: 'AccumulatedDepreciation', width: 18 },
      { header: 'มูลค่าทรัพย์สินสุทธิ', key: 'BookValue', width: 20 },
      { header: 'วันที่รับ', key: 'ReceiptDate', width: 18 }
    ];

    // เพิ่มข้อมูลลงตาราง
    this.dataSource.data.forEach(asset => {
      worksheet.addRow({
        AssetCode: asset.AssetCode,
        AssetName: asset.AssetName,
        PurchasePrice: asset.PurchasePrice,
        Quantity: asset.Quantity,
        Amount: asset.PurchasePrice * asset.Quantity,
        DepreciationRate: asset.DepreciationRate,
        OpeningValue: asset.PurchasePrice,
        DepreciationValue: asset.DepreciationValue,
        AccumulatedDepreciation: asset.AccumulatedDepreciation,
        BookValue: asset.BookValue,
        ReceiptDate: this.formatDate(asset.ReceiptDate),
      });
    });

    // ใส่เส้นขอบให้ทุกเซลล์
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ทะเบียนค่าเสื่อมครุภัณฑ์.xlsx';
      a.click();
    });
  }



}