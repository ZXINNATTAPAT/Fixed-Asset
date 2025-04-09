import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { IconDirective } from '@coreui/icons-angular';
import { ButtonDirective, FormDirective, TextColorDirective } from '@coreui/angular';
import { ApiService } from 'src/ApiController/apiservice/api-service.service';
import { AssetInventoryCycle } from 'src/ApiController/apiservice/inventory/inventory.service';
import { Router } from '@angular/router';
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash,cilSearch } from '@coreui/icons';


@Component({
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatPaginatorModule, MatTableModule, MatFormFieldModule, MatSelectModule,
    TextColorDirective, FormDirective, ButtonDirective, IconDirective
  ],
  selector: 'app-asset-inventory-cycle',
  templateUrl: './asset-inventory-cycle.component.html',
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

  constructor(private apiService: ApiService,private router: Router) {}
  
  ngOnInit(): void {
    this.loadCycles();
  }

  loadCycles() {
    this.apiService.inventoryService.getCycles()
      .subscribe({
        next: (data) => this.cycles = data,
        error: (err) => console.error('Error fetching cycles:', err)
      });
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

  toInventorytable() {
    this.router.navigate(['table/inventorysession']);
  }
  

}
