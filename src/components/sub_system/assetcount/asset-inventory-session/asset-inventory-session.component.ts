import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule, NgFor } from '@angular/common';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';
import { AssetInventorySessionHelper } from './utils';
import { MatDialog } from '@angular/material/dialog';
import { cilSearch, cilPencil, cilTrash, cilInfo } from '@coreui/icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { AssetInventoryComponent } from '../asset-inventory/asset-inventory.component';
import { TextColorDirective, FormDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import Swal from 'sweetalert2';
import { EditSessionDialogComponent } from './Dialog/edit-session-dialog/edit-session-dialog.component';
import { AssetInventoryCycle, AssetInventorySession } from '../../../../ApiController/apiservice/inventory/inventory.service';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input'; // Ensure matInput is available
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker'; // Add this import
import { MatNativeDateModule } from '@angular/material/core'; // Add this import

@Component({
  selector: 'app-asset-inventory-session',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatPaginatorModule, MatTableModule, MatFormFieldModule, MatSelectModule,
    AssetInventoryComponent, TextColorDirective, FormControlDirective, FormDirective, ButtonDirective, IconDirective, MatTabsModule,
    MatTabGroup, MatIcon, MatSort, MatTable, NgFor, MatInputModule, MatDatepickerModule, MatNativeDateModule, // Add these modules
  ],
  templateUrl: './asset-inventory-session.component.html',
  styleUrl: './asset-inventory-session.component.scss'
})
export class AssetInventorySessionComponent implements OnInit {
  
  @ViewChild('tabGroup') tabGroup: any;

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  myFunctionInstance: AssetInventorySessionHelper; 

  displayedColumns: string[] = ['actions', 'SessionName', 'Date', 'InspectorsList', 'VerifierName'];

  displayedColumnsDetails: string[] = ['AssetCode', 'AssetName', 'SystemQuantity', 'CountedQuantity', 'Note'];

  displayedColumnsasset: string[] = ['action', 'AssetCode', 'AssetName', 'SystemQuantity', 'Note'];
  
  displayedColumnscycle: string[] = ['select', 'CycleName', 'DateStart', 'DateEnd', 'Note'];

  selectedSessionId: number | null = null; 
  
  selectedCycleId: number | null = null;

  assetDetails: AssetInventorySession[] = [];

  inventoryDetails: any[] = [];
  
  cycles: any[] = [];
  
  selectedSessionName: string | null = null;// เพิ่มตัวแปรเก็บชื่อรอบการตรวจนับ

  dataSource: MatTableDataSource<AssetInventorySession>;

  dataSourcecycle = new MatTableDataSource<AssetInventoryCycle>([]);
  
  dataSourceasset = new MatTableDataSource<any>([]);
  
  filters = { SessionName: '', Date: '', Inspector: '', Verifier: '' }; // ✅ กรองตามช่อง input เฉพาะคอลัมน์

  instan = { cilPencil, cilTrash, cilInfo, cilSearch };
  availableYears: string[] = [];
  selectedYear: any;

  
  constructor(private apiService: ApiService, public dialog: MatDialog) {
    this.myFunctionInstance = new AssetInventorySessionHelper();
    this.dataSource = new MatTableDataSource<AssetInventorySession>([]);
    this.getAssetDetails();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.loadCycles();
  }

  loadCycles() {
    this.apiService.assetService.fetchData('AssetInventoryCycle').subscribe({
      next: (data) => {
        this.cycles = data;
        this.availableYears = [...new Set((data as AssetInventoryCycle[]).map((cycle) => new Date(cycle.DateStart).getFullYear().toString()))];
        this.dataSourcecycle = new MatTableDataSource(data);
        this.dataSourcecycle.paginator = this.paginator;
        this.dataSourcecycle.sort = this.sort;
      },
      error: (err) => console.error('Error fetching cycles:', err)
    });
  }

  selectCycle(cycleId: number) {
    this.selectedCycleId = cycleId;

    // โหลด session ตามรอบ
    this.apiService.assetService.fetchData(`AssetInventorySession/byCycle/${cycleId}`).subscribe({
      next: (data) => {
        this.assetDetails = data.map((session: { Date: string; Inspectors: any; VerifierName: any; }) => ({
          ...session,
          Date: this.convertDate(session.Date),
          InspectorsList: (session.Inspectors ?? []).map((i: { InspectorName: any; }) => i.InspectorName).join(', ') || 'ไม่ระบุ',
          VerifierName: session.VerifierName || 'ไม่ระบุ'
        }));
        this.dataSource = new MatTableDataSource<AssetInventorySession>(this.assetDetails);
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.customFilterPredicate();
      },
      error: (err) => console.error('Error loading session:', err)
    });
    this.tabGroup.selectedIndex = 1;
  }

  applyYearFilter(): void {
    if (this.selectedYear) {
      this.dataSourcecycle.data = this.cycles.filter(
        cycle => cycle.DateStart && new Date(cycle.DateStart).getFullYear().toString() === this.selectedYear
      );
    } else {
      this.dataSourcecycle.data = [...this.cycles]; // Reset to all cycles if no year is selected
    }
  }
  

  applyFilters() {
    const filterValue = JSON.stringify(this.filters).toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // ✅ โหลดข้อมูล session พร้อมแปลงวันที่และชื่อ
  private getAssetDetails(): void {
    this.apiService.assetService.fetchData('AssetInventorySession').subscribe({
      next: (data) => {
        this.assetDetails = (data as AssetInventorySession[]).map(session => ({
          ...session,
          Date: this.convertDate(session.Date),
          InspectorsList: (session.Inspectors ?? []).map(i => i.InspectorName).join(', ') || 'ไม่ระบุ',
          VerifierName: session.VerifierName || 'ไม่ระบุ'
        }));

        this.assetDetails.sort(this.sortByDate);

        this.dataSource = new MatTableDataSource<AssetInventorySession>(this.assetDetails);
        this.dataSource.paginator = this.paginator;

        // ✅ ตั้ง filterPredicate ที่นี่เลย
        this.dataSource.filterPredicate = this.customFilterPredicate();
      },
      error: (err) => console.error('❌ Error loading AssetInventorySession:', err),
    });
  }

  // ✅ เรียงตามวันที่
  private sortByDate(a: AssetInventorySession, b: AssetInventorySession): number {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  }

  // ✅ แปลงวันที่ให้อยู่ในรูปแบบไทย
  private convertDate(DateString: string): string {
    if (!DateString) return '-';
    const date = new Date(DateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private customFilterPredicate(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);

      return (
        (data.SessionName ?? '').toLowerCase().includes(searchTerms.SessionName) &&
        (data.Date ?? '').toLowerCase().includes(searchTerms.Date) &&
        (data.InspectorsList ?? '').toLowerCase().includes(searchTerms.Inspector) &&
        (data.VerifierName ?? '').toLowerCase().includes(searchTerms.Verifier)
      );
    };
  }
  
  // 🔹 เมื่อกดปุ่ม "ดูรายละเอียด"
  viewSession(sessionId: number) {
    this.selectedSessionId = sessionId;

    // ค้นหาชื่อของ Session ตาม SessionId
    const session = this.assetDetails.find(s => s.SessionId === sessionId);
    this.selectedSessionName = session ? session.SessionName : 'ไม่พบชื่อรอบ';

    // โหลดข้อมูล InventoryDetails ตาม SessionId
    this.apiService.assetService.fetchData(`AssetInventorySession/${sessionId}`).subscribe({
      next: (data) => {
        this.inventoryDetails = data.InventoryDetails || []; // ถ้าไม่มีข้อมูลให้กำหนดเป็นอาร์เรย์ว่าง
        this.dataSourceasset = new MatTableDataSource(this.inventoryDetails);
        this.dataSourceasset.paginator = this.paginator;
        this.dataSourceasset.sort = this.sort;
      },
      error: (err) => console.error('Error fetching inventory details:', err),
    });

    this.tabGroup.selectedIndex = 2;
  }

  // 🔹 อัปเดตรายการตรวจนับครุภัณฑ์
  editSession(sessionId: number) {
    const session = this.dataSource.data.find(s => s.SessionId === sessionId);

    if (!session) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลที่ต้องแก้ไข', 'error');
      return;
    }

    const dialogRef = this.dialog.open(EditSessionDialogComponent, {
      width: '400px',
      data: { session } // ✅ ต้องส่ง `{ session }` ไปด้วย
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          console.log("Result from dialog:", result); // ✅ Debug ก่อนใช้งาน

          interface UpdatedData {
            SessionName: string;
            Date: string;
            VerifierId: number;
            Inspectors: { SessionId: number; InspectorId: number }[];
          }

          const updatedData: UpdatedData = {
            SessionName: result.SessionName,
            Date: result.Date,
            VerifierId: result.VerifierId,
            Inspectors: Array.isArray(result.Inspectors) && result.Inspectors.length > 0
              ? result.Inspectors.map((inspector: { InspectorId: number }) => ({
                SessionId: sessionId,
                InspectorId: inspector.InspectorId
              }))
              : [] // ✅ ถ้า `Inspectors` ไม่มีค่า ให้ส่ง `[]`
          };

          console.log("Updated Data:", updatedData); // ✅ Debug ก่อนส่ง API

          await this.apiService.assetService.updateDataById('AssetInventorySession', sessionId, updatedData);

          Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว', 'success');
          this.getAssetDetails();
        } catch (error) {
          console.error('API Error:', error);
          Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
        }
      }
    });
  }

  // 🔹 ลบรายการตรวจนับครุภัณฑ์
  async deleteSession(session: AssetInventorySession) {
    console.log('Delete session:', session.SessionId);

    const confirmDelete = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบ "${session.SessionName}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirmDelete.isConfirmed) {
      try {
        await this.apiService.assetService.deleteData(`AssetInventorySession/${session.SessionId}`);
        Swal.fire('สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
        console.log('Deleted session:', session.SessionId);

        // 🔹 โหลดข้อมูลใหม่
        this.getAssetDetails();
      } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        console.error('Error deleting session:', error);
      }
    }
  }
  
  // 🔹 เมื่อกด "ย้อนกลับ"
  backToSessions() {this.selectedSessionId = null; this.selectedSessionName = null; this.inventoryDetails = [];}
  

  onDateFilter(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value; // Use the `value` property of MatDatepickerInputEvent
    if (selectedDate) {
      this.filters.Date = selectedDate.toISOString().split('T')[0]; // Format the date as 'yyyy-MM-dd'
      this.applyFilters();
    }
  }
  // onDepartmentFilter(departmentId: string): void {
  //   this.filters.DepartmentId = departmentId;
  //   this.applyFilters();
  // }
  // onFactionFilter(factionId: string): void {
  //   this.filters.FactionId = factionId;
  //   this.applyFilters();
  // }
  
}
