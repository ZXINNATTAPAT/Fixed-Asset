import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
import { ApiService, AssetInventorySession } from '../../../ApiController/api-service.service';
import { AssetInventorySessionHelper } from './utils';
import { MatDialog } from '@angular/material/dialog';
import { cilSearch, cilPencil, cilTrash, cilInfo } from '@coreui/icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { AssetInventoryComponent } from '../asset-inventory/asset-inventory.component';
import { TextColorDirective, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import Swal from 'sweetalert2';
import { EditSessionDialogComponent } from './Dialog/edit-session-dialog/edit-session-dialog.component';

@Component({
  selector: 'app-asset-inventory-session',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    AssetInventoryComponent,
    TextColorDirective,
    FormControlDirective,
    FormDirective,
    ButtonDirective,
    IconDirective
  ],
  templateUrl: './asset-inventory-session.component.html',
  styleUrl: './asset-inventory-session.component.scss'
})
export class AssetInventorySessionComponent implements OnInit {

  displayedColumns: string[] = ['SessionId', 'SessionName', 'Date', 'actions'];

  displayedColumnsDetails: string[] = ['AssetCode', 'AssetName', 'SystemQuantity', 'CountedQuantity', 'Note'];

  selectedSessionId: number | null = null; // ใช้ตรวจสอบว่าต้องแสดงข้อมูล InventoryDetails หรือไม่

  assetDetails: AssetInventorySession[] = [];

  inventoryDetails: any[] = [];

  dataSource: MatTableDataSource<AssetInventorySession>;

  myFunctionInstance: AssetInventorySessionHelper;

  // icons = { cilPencil, cilTrash, cilInfo, cilSearch };

  instan = { icons: { cilPencil, cilTrash, cilInfo, cilSearch } }; // ✅ ตรวจสอบว่าไอคอนถูกต้อง
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private apiService: ApiService, public dialog: MatDialog) {
    this.myFunctionInstance = new AssetInventorySessionHelper();
    this.dataSource = new MatTableDataSource<AssetInventorySession>([]);
    this.getAssetDetails();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  // 🔹 โหลดข้อมูล AssetInventorySession
  private getAssetDetails(): void {
    this.apiService.fetchDatahttp('AssetInventorySession').subscribe({
      next: (data) => {
        // ✅ แปลงวันที่และเรียงลำดับก่อนใส่ลงใน `this.assetDetails`
        this.assetDetails = (data as AssetInventorySession[])
          .map(session => ({
            ...session,
            Date: this.convertDate(session.Date), // ✅ ใช้ฟังก์ชันแปลงวันที่
          }))
          .sort((a, b) => this.sortByDate(a, b)); // ✅ เรียงลำดับวันที่

        // ✅ อัปเดต DataSource และ Paginator
        this.dataSource = new MatTableDataSource<AssetInventorySession>(this.assetDetails);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error('Error loading AssetInventorySession:', err),
    });
  }


  // 🔹 เรียงตามวันที่ (ล่าสุดก่อน)
  private sortByDate(a: AssetInventorySession, b: AssetInventorySession): number {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  }

  // 🔹 แปลงวันที่เป็นรูปแบบไทย
  private convertDate(DateString: string): string {
    if (!DateString) return '-'; // ถ้าไม่มีค่าให้คืนค่า "-"
    const date = new Date(DateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }


  // เพิ่มตัวแปรเก็บชื่อรอบการตรวจนับ
  selectedSessionName: string | null = null;

  // 🔹 เมื่อกดปุ่ม "ดูรายละเอียด"
  viewSession(sessionId: number) {
    console.log('View session:', sessionId);
    this.selectedSessionId = sessionId;

    // ค้นหาชื่อของ Session ตาม SessionId
    const session = this.assetDetails.find(s => s.SessionId === sessionId);
    this.selectedSessionName = session ? session.SessionName : 'ไม่พบชื่อรอบ';

    // โหลดข้อมูล InventoryDetails ตาม SessionId
    this.apiService.fetchDatahttp(`AssetInventorySession/${sessionId}`).subscribe({
      next: (data) => {
        this.inventoryDetails = data.InventoryDetails || []; // ถ้าไม่มีข้อมูลให้กำหนดเป็นอาร์เรย์ว่าง
      },
      error: (err) => console.error('Error fetching inventory details:', err),
    });
  }

  // 🔹 เมื่อกด "ย้อนกลับ"
  backToSessions() {
    this.selectedSessionId = null;
    this.selectedSessionName = null;
    this.inventoryDetails = [];
  }

  // 🔹 อัปเดตรายการตรวจนับครุภัณฑ์
  editSession(sessionId: number) {
    console.log("Opening edit dialog for sessionId:", sessionId);
  
    const session = this.dataSource.data.find(s => s.SessionId === sessionId);
    console.log("Session data:", session); // ✅ Debug ตรวจสอบค่า session
  
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
  
          await this.apiService.updateData(`AssetInventorySession/${sessionId}`, updatedData);
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
        await this.apiService.deleteData(`AssetInventorySession/${session.SessionId}`);
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
