import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators ,FormsModule} from '@angular/forms';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-disasset-sale',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  ],
  templateUrl: './disasset-sale.component.html'
})
export class DisassetSaleComponent implements OnInit {
  saleForm!: FormGroup;
  searchTerm: string = '';
  displayedColumns: string[] = ['actions','assetCode', 'assetName', 'saleDate', 'sellingprice', 'bookValue', 'profit'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private ap: ApiService) {}

  ngOnInit(): void {
    this.saleForm = this.fb.group({
      assetId: ['', Validators.required],
      purchaseDate: [{ value: '', disabled: true }],
      saleDate: ['', Validators.required],
      sellingprice: ['', [Validators.required, Validators.min(0)]],
      bookValue: [{ value: '', disabled: true }],
      profit: [{ value: '', disabled: true }],
      description: ['']
    });

    this.saleForm.get('bookValue')?.valueChanges.subscribe(() => this.calculateProfit());
    this.saleForm.get('sellingprice')?.valueChanges.subscribe(() => this.calculateProfit());

    // ✅ โหลดข้อมูลใส่ตารางเมื่อเริ่มหน้า
    this.getAssetSales();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAssetSales(): void {
    this.ap.assetService.fetchData('AssetSales').subscribe((data: any[]) => {
      this.dataSource.data = data || [];
    }, (err) => {
      console.error('🚨 Error loading asset sales:', err);
    });
  }

  onSearch(): void {
    const search = this.searchTerm.trim();
    if (!search) return;

    this.ap.assetService.fetchData(`AssetDetails?search=กกต ${search}`).subscribe((data) => {
      if (!data || data.length === 0) {
        alert('ไม่พบข้อมูลที่ค้นหา');
        return;
      }

      const asset = data[0];
      this.saleForm.patchValue({
        assetId: asset.AssetId,
        purchaseDate: this.formatDate(asset.PurchaseDate),
        bookValue: asset.BookValue
      });
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  calculateProfit(): void {
    const selling = this.saleForm.get('sellingprice')?.value || 0;
    const book = this.saleForm.get('bookValue')?.value || 0;
    this.saleForm.get('profit')?.setValue(selling - book);
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const raw = this.saleForm.getRawValue();

    const payload = {
      statusId: 7,
      assetId: raw.assetId,
      purchaseDate: new Date(raw.purchaseDate + 'T00:00:00').toISOString(),
      saleDate: new Date(raw.saleDate + 'T00:00:00').toISOString(),
      sellingprice: +raw.sellingprice,
      bookValue: +raw.bookValue,
      profit: +raw.profit,
      description: raw.description || '-'
    };

    this.ap.assetService.postData('AssetSales', payload)
      .then(() => {
        alert('บันทึกข้อมูลสำเร็จ');
        this.saleForm.reset();
        this.getAssetSales(); // ✅ โหลดใหม่หลังบันทึก
      })
      .catch((err) => {
        alert('เกิดข้อผิดพลาดในการบันทึก');
        console.error('🔥 Error:', err);
      });
  }

  deleteRow(row: any): void {
    this.dataSource.data = this.dataSource.data.filter(item => item !== row);
  }
}


