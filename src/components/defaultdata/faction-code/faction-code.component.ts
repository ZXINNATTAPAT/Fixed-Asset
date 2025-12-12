import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EditFactionCodeDialogComponent } from './Dialog/edit-faction-code-dialog.component';

import { Router } from '@angular/router';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableModule, UtilitiesModule } from '@coreui/angular';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


interface FactionType {
  FactId: number;
  Code: string;
  Name: string;
  Semin: string;
  DeptId: number;
  DeptName?: string;   // ชื่อสำนักที่แมปเข้ามา
}

interface Department {
  DeptId: number;
  Name: string;
}

interface AssetDetails {
  FactionCode: string;
  FactionName: string;
}

@Component({
  selector: 'app-faction-code',
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    MatOptionModule,MatSelectModule,
  ],
  templateUrl: './faction-code.component.html',
  styleUrl: './faction-code.component.scss',
})
export class FactionCodeComponent implements OnInit {

  icons = { cilPencil, cilTrash };
  // ตาราง
  displayedColumns: string[] = ['actions','Code', 'Name', 'Semin', 'DeptName'];
  dataSource = new MatTableDataSource<FactionType>([]);

  // ข้อมูล
  factions: FactionType[] = [];
  departments: Department[] = [];

  // ฟอร์ม
  asset: Partial<FactionType> = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private ap: ApiService, private dialog:MatDialog) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  // โหลดสำนักก่อน เพื่อจะได้แมปชื่อ
  private loadDepartments(): void {
    this.ap.assetService.fetchData('Departments').subscribe({
      next: (depts: any[]) => {
        this.departments = depts.map(d => ({
          DeptId: d.DeptId,
          Name: d.Name
        }));
        // พอโหลดสำนักเสร็จ ค่อยโหลดฝ่าย
        this.loadFactions();
      },
      error: err => console.error('Error loading departments', err)
    });
  }

  // โหลดรหัสฝ่าย และแมปชื่อสำนัก
  private loadFactions(): void {
    this.ap.assetService.fetchData('Factiontypecodes').subscribe({
      next: (list: any[]) => {
        this.factions = list.map(item => {
          const f: FactionType = {
            FactId: item.FactId,
            Code: item.Code,
            Name: item.Name,
            Semin: item.Semin,
            DeptId: item.DeptId,
            DeptName: this.departments.find(d => d.DeptId === item.DeptId)?.Name || ''
          };
          return f;
        });
        this.dataSource.data = this.factions;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
      },
      error: err => console.error('Error fetching faction codes', err)
    });
  }

  // บันทึกข้อมูลใหม่
  onSubmit(): void {
    if (!this.asset.Code || !this.asset.Name || !this.asset.Semin || !this.asset.DeptId) {
      Swal.fire('กรุณากรอกให้ครบทุกช่อง', '', 'warning');
      return;
    }

    this.ap.assetService.postData('Factiontypecodes', this.asset).then(
      (resp: any) => {
        // เพิ่มเข้า array พร้อมแมปชื่อสำนัก
        const newFaction: FactionType = {
          FactId: resp.FactId,
          Code: resp.Code,
          Name: resp.Name,
          Semin: resp.Semin,
          DeptId: resp.DeptId,
          DeptName: this.departments.find(d => d.DeptId === resp.DeptId)?.Name || ''
        };
        this.factions.push(newFaction);
        this.dataSource.data = this.factions;

        Swal.fire('บันทึกเสร็จสิ้น', '', 'success');
        this.asset = {};  // ล้างฟอร์ม
      },
      err => {
        console.error('Error saving faction code', err);
        Swal.fire('มีข้อมูลในระบบอยู่แล้ว', '', 'error');
      }
    );
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      Code: 'รหัสฝ่าย',
      Name: 'ชื่อฝ่าย',
      Semin: 'ชื่อย่อ',
      DepartmentName: 'ชื่อสำนัก',
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  deleteAsset(asset: FactionType): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบข้อมูลฝ่ายนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ap.assetService.deleteData(`Factiontypecodes/${asset.FactId}`).then(() => {
          this.factions = this.factions.filter(a => a.FactId !== asset.FactId);
          this.dataSource.data = this.factions;
          Swal.fire('ลบแล้ว!', 'ข้อมูลฝ่ายของคุณถูกลบแล้ว', 'success');
        }).catch((error) => {
          console.error('Error deleting faction type code:', error);
          Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบข้อมูลฝ่าย', 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('ยกเลิกแล้ว', 'ข้อมูลฝ่ายของคุณปลอดภัย :)', 'info');
      }
    });
  }
  
  editAsset(asset: FactionType): void {
    const dialogRef = this.dialog.open(EditFactionCodeDialogComponent, {
      width: '800px',
      data: { ...asset }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.factions.findIndex(a => a.FactId === asset.FactId);
        if (index !== -1) {
          // อัปเดต UI อย่างเดียว เพราะ backend ทำสำเร็จแล้วใน dialog
          this.factions[index] = {
            ...this.factions[index],
            ...result,
            DeptName: this.departments.find(d => d.DeptId === result.DeptId)?.Name || ''
          };
          this.dataSource.data = this.factions;
        }
        Swal.fire('สำเร็จ', 'ข้อมูลฝ่ายถูกแก้ไขแล้ว', 'success');
      }
    });
  }
  
  
}

