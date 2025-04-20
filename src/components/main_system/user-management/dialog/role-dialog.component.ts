import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatOption, MatSelect } from '@angular/material/select';
import { ApiService } from '../../../../../src/ApiController/apiservice/api-service.service';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [MatSelect, MatOption, MatDialogModule, CommonModule, MatCommonModule, MatButton, FormsModule],
  template: `
    <h1 mat-dialog-title class="anuphan-600">เปลี่ยนบทบาท</h1>
    <div mat-dialog-content>
      <div class="form-control anuphan-600">
        <mat-select [(ngModel)]="selectedRoleId" placeholder="เลือกบทบาท">
          <mat-option *ngFor="let role of availableRoles" [value]="role.RoleId">
            <span>{{ role.RoleName }}</span>
          </mat-option>
        </mat-select>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">ยกเลิก</button>
      <button mat-raised-button color="primary" (click)="onSave()">บันทึก</button>
    </div>
  `,
})
export class RoleDialogComponent implements OnInit {
  availableRoles: any[] = [];
  selectedRoleId: number = 0;

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ap: ApiService
  ) {
    // รับ role ปัจจุบันจาก data ที่ส่งมา แล้ว map เป็น RoleId ถ้าได้
    const currentRole = data?.currentRole;
    if (typeof currentRole === 'object' && currentRole?.RoleId) {
      this.selectedRoleId = currentRole.RoleId;
    } else if (typeof currentRole === 'string') {
      // fallback กรณี currentRole เป็น RoleName → ค่อยแมปใน ngOnInit
      this.selectedRoleId = 0;
    }
  }

  ngOnInit(): void {
    this.ap.role.loadRoles().subscribe((roles) => {
      this.availableRoles = roles;

      // ถ้า currentRole เป็น string → map หา roleId ที่ตรงกัน
      if (typeof this.data?.currentRole === 'string') {
        const match = this.availableRoles.find(r => r.RoleName === this.data.currentRole);
        if (match) {
          this.selectedRoleId = match.RoleId;
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const selected = this.availableRoles.find(role => role.RoleId === this.selectedRoleId);
    if (selected) {
      // ส่งกลับในรูปแบบ camelCase ให้ backend
      this.dialogRef.close({
        roleId: selected.RoleId,
        roleName: selected.RoleName
      });
    }
  }
}
