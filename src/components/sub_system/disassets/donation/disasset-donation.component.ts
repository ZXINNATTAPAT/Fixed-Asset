import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule ,FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-disasset-donation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule ,MatSortModule, MatPaginatorModule ,MatTableModule],
  templateUrl: './disasset-donation.component.html',
})
export class DisassetDonationComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['actions','assetCode', 'assetDetails', 'recipientName', 'contactNumber', 'donationDate', 'notes'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  donationForm!: FormGroup;
  searchTerm: string = '';

  constructor(private fb: FormBuilder, private ap: ApiService) {}

  ngOnInit(): void {
    this.donationForm = this.fb.group({
      assetId: ['', Validators.required],
      recipientName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      assetDetails: ['', Validators.required],
      donationDate: ['', Validators.required],
      notes: ['']
    });

    this.dataSource.data = [];
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
      this.donationForm.patchValue({
        assetId: asset.AssetId,
        assetDetails: `${asset.AssetCode} - ${asset.AssetName}`,
      });
    });
  }

  onSubmit(): void {
    if (this.donationForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
  
    const raw = this.donationForm.getRawValue();
  
    const payload = {
      ...raw,
      statusId: 5, // บริจาค
      donationDate: new Date(raw.donationDate + 'T00:00:00').toISOString(), // ✅ แปลงให้เป็น UTC ISO
    };
  
    this.ap.assetService.postData('AssetSharing', payload)
      .then(() => {
        alert('บันทึกข้อมูลบริจาคสำเร็จ');
        this.donationForm.reset();
        this.dataSource.data = [];
      })
      .catch((err) => {
        alert('เกิดข้อผิดพลาด');
        console.error('🔥 Donation Submit Error:', err);
      });
  }
  

  deleteRow(row: any): void {
    this.dataSource.data = this.dataSource.data.filter(item => item !== row);
  }

}
