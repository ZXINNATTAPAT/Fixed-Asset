import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ApiService, AssetInventorySession } from 'src/app/ApiController/api-service.service';
import { AssetInventorySessionHelper } from './utils';
import { MatDialog } from '@angular/material/dialog';
import { IconDirective } from '@coreui/icons-angular';
import { cilSearch, cilPencil, cilTrash, cilInfo } from '@coreui/icons';
import {
  TextColorDirective,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-asset-inventory-session',
  standalone: true,
  imports: [
    TextColorDirective,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        IconDirective,
        FormDirective,
        FormLabelDirective,
        FormControlDirective,
        MatPaginatorModule,
        MatTableModule,
        MatFormFieldModule,
        MatSelectModule,
        ButtonDirective,
        // MatDialog,
        // ResizedDirective,
        NgStyle,
  ],
  templateUrl: './asset-inventory-session.component.html',
  styleUrl: './asset-inventory-session.component.scss'
})
export class AssetInventorySessionComponent implements OnInit {
  displayedColumns: string[];
  displayedColumns3: string[];
  assetDetails: AssetInventorySession[] = [];
  dataSource: MatTableDataSource<AssetInventorySession>;
  myFunctionInstance: AssetInventorySessionHelper ;
  icons = { cilPencil, cilTrash, cilInfo, cilSearch };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private apiService: ApiService, public dialog: MatDialog) {
    this.myFunctionInstance = new AssetInventorySessionHelper();
    this.displayedColumns = this.myFunctionInstance.displayedColumns; // ✅ เพิ่ม "actions"
    this.displayedColumns3 = this.myFunctionInstance.displayedColumns3; // ✅ เพิ่ม "actions"
    this.dataSource = new MatTableDataSource<AssetInventorySession>([]);
    this.getAssetDetails();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  // 🔹 โหลดข้อมูล AssetInventorySession
  private getAssetDetails(): void {
    this.apiService.fetchDatahttp('AssetInventorySession').subscribe({
      next: (data) => this.handleAssetDetails(data),
      error: (err) => console.error('Error loading AssetInventorySession:', err),
    });
  }

  // 🔹 จัดการข้อมูล AssetInventorySession
  private handleAssetDetails(data: any[]): void {
    this.assetDetails = data
      .map((session) => this.transformSession(session))
      .sort((a, b) => this.sortByDate(a, b));

    this.dataSource = new MatTableDataSource<AssetInventorySession>(this.assetDetails); // ✅ อัปเดต dataSource
    this.dataSource.paginator = this.paginator;
    console.log('Processed AssetInventorySession:', this.assetDetails);
  }

  // 🔹 เรียงตามวันที่ (ล่าสุดก่อน)
  private sortByDate(a: AssetInventorySession, b: AssetInventorySession): number {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  }

  // 🔹 แปลงข้อมูล AssetInventorySession
  private transformSession(session: AssetInventorySession): AssetInventorySession {
    return {
      ...session,
      Date: this.myFunctionInstance.convertDate(session.Date), // ✅ ตรวจสอบว่ามีค่าก่อนแปลง
    };
  }

  viewSession(sessionId: number) {
    console.log('View session:', sessionId);
  }

  editSession(sessionId: number) {
    console.log('Edit session:', sessionId);
  }

  deleteSession(session: AssetInventorySession) {
    console.log('Delete session:', session.SessionId);
  }
}
