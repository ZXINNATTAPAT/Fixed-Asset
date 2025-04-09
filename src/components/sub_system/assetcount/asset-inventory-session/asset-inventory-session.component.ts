import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
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
import { AssetInventoryCycle, AssetInventorySession } from 'src/ApiController/apiservice/inventory/inventory.service';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-asset-inventory-session',
  standalone: true,
  imports: [
    CommonModule,ReactiveFormsModule,FormsModule,MatPaginatorModule,MatTableModule,MatFormFieldModule,MatSelectModule,
    AssetInventoryComponent,TextColorDirective,FormControlDirective,FormDirective,ButtonDirective,IconDirective,MatTabsModule,
    MatTabGroup,MatIcon,MatSort,MatTable
  ],
  templateUrl: './asset-inventory-session.component.html',
  styleUrl: './asset-inventory-session.component.scss'
})
export class AssetInventorySessionComponent implements OnInit {
  
  @ViewChild('tabGroup') tabGroup: any;

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['actions', 'SessionName', 'Date', 'InspectorsList', 'VerifierName'];

  displayedColumnsDetails: string[] = ['AssetCode', 'AssetName', 'SystemQuantity', 'CountedQuantity', 'Note'];

  selectedSessionId: number | null = null;

  assetDetails: AssetInventorySession[] = [];

  inventoryDetails: any[] = [];

  dataSource: MatTableDataSource<AssetInventorySession>;

  displayedColumnscycle: string[] = ['select', 'CycleName', 'DateStart', 'DateEnd', 'Note'];

  dataSourcecycle = new MatTableDataSource<AssetInventoryCycle>([]);

  displayedColumnsasset: string[] = ['action', 'AssetCode', 'AssetName', 'SystemQuantity', 'Note'];
  dataSourceasset = new MatTableDataSource<any>([]);
  
  myFunctionInstance: AssetInventorySessionHelper; 

  filters = {SessionName: '',Date: '',Inspector: '',Verifier: ''}; // ✅ กรองตามช่อง input เฉพาะคอลัมน์

  selectedCycleId: number | null = null;

  instan = { cilPencil, cilTrash, cilInfo, cilSearch };
  
  cycles: any[] = [];
  
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

  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      sessionName: this.filters.SessionName || '',
      date: this.filters.Date || '',
      inspector: this.filters.Inspector || '',
      verifier: this.filters.Verifier || ''
    });
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
        (data.SessionName ?? '').toLowerCase().includes(searchTerms.sessionName.toLowerCase()) &&
        (data.Date ?? '').toLowerCase().includes(searchTerms.date.toLowerCase()) &&
        (data.InspectorsList ?? '').toLowerCase().includes(searchTerms.inspector.toLowerCase()) &&
        (data.VerifierName ?? '').toLowerCase().includes(searchTerms.verifier.toLowerCase())
      );
    };
  }
  // เพิ่มตัวแปรเก็บชื่อรอบการตรวจนับ
  selectedSessionName: string | null = null;

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
  // 🔹 เมื่อกด "ย้อนกลับ"
  backToSessions() {this.selectedSessionId = null; this.selectedSessionName = null; this.inventoryDetails = [];}

  // 🔹 อัปเดตรายการตรวจนับครุภัณฑ์
  editSession(sessionId: number) {
    // console.log("Opening edit dialog for sessionId:", sessionId);

    const session = this.dataSource.data.find(s => s.SessionId === sessionId);
    // console.log("Session data:", session); // ✅ Debug ตรวจสอบค่า session

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
}
