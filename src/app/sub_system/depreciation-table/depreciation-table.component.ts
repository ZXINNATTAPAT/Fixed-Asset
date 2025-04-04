import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { IconDirective } from '@coreui/icons-angular';
import { cilInfo, cilPencil, cilSearch, cilTrash } from '@coreui/icons';
import * as ExcelJS from 'exceljs';
import { InfoassetComponent } from '../../main_system/infoasset/infoasset.component';
import { EditAssetDialog } from '../../main_system/asset-table/Dialog/edit-dialog/edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-depreciation-table',
  standalone: true,
  imports: [CommonModule,MatTableModule ,MatPaginatorModule,IconDirective,
    MatSortModule],
  templateUrl: './depreciation-table.component.html',
  styleUrl: './depreciation-table.component.scss'
})
export class DepreciationTableComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['actions',
    'code', 'name', 'price', 'qty', 'amount', 'rate',
    'openingValue', 'depreciation', 'accumulated',
    'netValue', 'received'
  ];
  instan = { icons: { cilPencil, cilTrash, cilInfo, cilSearch } };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private ap: ApiService,public dialog: MatDialog) {}

  ngOnInit(): void {
    this.ap.assetService.fetchData('AssetDetails/Depreciations').subscribe(
      data => this.dataSource.data = data,
      err => console.error('API error', err)
    );
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