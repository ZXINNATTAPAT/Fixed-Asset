import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-disasset-decommission',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSort, MatPaginatorModule, MatSortModule, MatTableModule],
  templateUrl: './disasset-decommission.component.html',
})
export class DisassetDecommissionComponent implements OnInit {
  decommissionForm!: FormGroup;
  searchTerm: string = '';

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['assetCode', 'description', 'saleDate', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(private fb: FormBuilder, private ap: ApiService) { }

  ngOnInit(): void {
    this.decommissionForm = this.fb.group({
      assetId: ['', Validators.required],
      saleDate: ['', Validators.required],
      description: ['', Validators.required]
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
      this.decommissionForm.patchValue({
        assetId: asset.AssetId,
        description: `${asset.AssetCode} - ${asset.AssetName}`
      });
    });
  }

  onSubmit(): void {
    if (this.decommissionForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const payload = {
      statusId: 3, // 3 = เลิกใช้
      ...this.decommissionForm.value,
    };

    this.ap.assetService.postData('AssetDisposal', payload).then(() => {
      alert('บันทึกข้อมูลการเลิกใช้สำเร็จ');
      this.decommissionForm.reset();
    }).catch((err) => {
      alert('เกิดข้อผิดพลาด');
      console.error(err);
    });
  }

  deleteRow(row: any): void {
    this.dataSource.data = this.dataSource.data.filter(item => item !== row);
  }
}
