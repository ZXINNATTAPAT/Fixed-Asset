import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { IconDirective } from '@coreui/icons-angular';
import { ButtonDirective, FormDirective, TextColorDirective } from '@coreui/angular';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';
import { AssetInventoryCycle } from '../../../../ApiController/apiservice/inventory/inventory.service';
import { Router } from '@angular/router';
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash,cilSearch } from '@coreui/icons';
import Swal from 'sweetalert2';


@Component({
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,NgFor,
    MatPaginatorModule, MatTableModule, MatFormFieldModule, MatSelectModule,
    TextColorDirective, FormDirective, ButtonDirective, IconDirective,
  ],
  selector: 'app-asset-inventory-cycle',
  templateUrl: './asset-inventory-cycle.component.html',
  styleUrls: ['./asset-inventory-cycle.component.scss']
})
export class AssetInventoryCycleComponent implements OnInit {

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo ,cilSearch };
  cycles: AssetInventoryCycle[] = [];

  newCycle: AssetInventoryCycle = {
    CycleName: '',
    DateStart: '',
    DateEnd: '',
    Note: '',
    CycleId: 0
  };

  displayedColumns: string[] = ['add','actions', 'CycleName', 'DateStart', 'DateEnd', 'Note'];
  dataSource = new MatTableDataSource<AssetInventoryCycle>();
  availableYears: string[] = [];
  selectedYear: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private apiService: ApiService,private router: Router) {}
  
  ngOnInit(): void {
    this.loadCycles();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCycles() {
    this.apiService.inventoryService.getCycles()
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.extractYears(data);
        },
        error: (err) => console.error('Error fetching cycles:', err)
      });
  }

  extractYears(cycles: AssetInventoryCycle[]) {
    const years = cycles.map((cycle) => new Date(cycle.DateStart).getFullYear().toString());
    this.availableYears = Array.from(new Set(years)).sort(); // Remove duplicates and sort
  }

  applyYearFilter() {
    if (this.selectedYear) {
      this.dataSource.data = this.dataSource.data.filter(
        (cycle) => new Date(cycle.DateStart).getFullYear().toString() === this.selectedYear
      );
    } else {
      this.loadCycles(); // Reset filter
    }
  }

  addCycle() {
    this.apiService.inventoryService.addCycle(this.newCycle)
      .subscribe({
        next: () => {
          this.newCycle = { 
            CycleName: '', 
            DateStart: new Date(this.newCycle.DateStart).toISOString(),
            DateEnd: new Date(this.newCycle.DateEnd).toISOString(),
            Note: '', 
            CycleId: 0 };
          this.loadCycles();
        },
        error: (err) => console.error('Error adding cycle:', err)
      });
  }

  deleteCycle(id: number) {
    if (confirm('คุณแน่ใจว่าต้องการลบรายการนี้?')) {
      this.apiService.inventoryService.deleteCycle(id)
        .subscribe({
          next: () => this.loadCycles(),
          error: (err) => console.error('Error deleting cycle:', err)
        });
    }
  }
  
  toInventoryCount(cycleId: number) {
    this.router.navigate(['system/sub/assetcount'], { queryParams: { cycleId } });
  }

  toInventorytable(cycleId: number) {
    this.router.navigate(['table/inventorysession'], { queryParams: { cycleId } });
  }
  
  minEndDate: string = ''; // วันที่สิ้นสุดอย่างน้อยต้องไม่ต่ำกว่านี้

updateMinDate(): void {
  if (this.newCycle.DateStart) {
    this.minEndDate = this.newCycle.DateStart;
    // ถ้า dateEnd ปัจจุบัน < dateStart ก็ล้างค่าเดิมทิ้ง
    if (this.newCycle.DateEnd && this.newCycle.DateEnd < this.newCycle.DateStart) {
      this.newCycle.DateEnd = '';
    }
  } else {
    this.minEndDate = '';
  }
}

  

}
