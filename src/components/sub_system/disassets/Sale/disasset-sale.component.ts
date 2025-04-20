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
  searchTerm: string = ''; // ✅ แก้ error [(ngModel)]="searchTerm"

   // 🔧 MatTable
   displayedColumns: string[] = ['assetCode', 'assetName', 'saleDate', 'sellingprice', 'bookValue', 'profit', 'actions'];
   dataSource = new MatTableDataSource<any>();
 
   @ViewChild(MatPaginator) paginator!: MatPaginator;
   @ViewChild(MatSort) sort!: MatSort;
 
   ngAfterViewInit(): void {
     this.dataSource.paginator = this.paginator;
     this.dataSource.sort = this.sort;
   }

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
  }

  // ✅ แก้ error (click)="onSearch()"
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

  // ✅ ฟังก์ชันแปลงวันที่ให้ใส่ input type="date"
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

    const payload = {
      statusId: 1, // 1 = ขาย
      ...this.saleForm.getRawValue()
    };

    this.ap.assetService.postData('AssetSales', payload).then(() => {
      alert('บันทึกข้อมูลสำเร็จ');
      this.saleForm.reset();
    }).catch((err) => {
      alert('เกิดข้อผิดพลาด');
      console.error(err);
    });
  }

  deleteRow(row: any): void {
    this.dataSource.data = this.dataSource.data.filter(item => item !== row);
  }
}

