import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-role-dialog',
  standalone:true,
  imports:[MatSelect,MatOption,MatDialogModule,CommonModule,MatCommonModule,MatButton,FormsModule],
  template: `
    <h1 mat-dialog-title style="font-family:Anuphan,sans-serif;font-optical-sizing:auto;font-weight:600;font-style:normal">เปลี่ยนบทบาท</h1>
    <div mat-dialog-content>
        <div class="form-control anuphan-600">
            <mat-select  [(ngModel)]="selectedRole" [placeholder]="'เลือกบทบาท'" style="font-family:Anuphan,sans-serif;font-optical-sizing:auto;font-weight:500;font-style:normal">
                <mat-option *ngFor="let role of availableRoles" [value]="role" style="font-family:Anuphan,sans-serif;font-optical-sizing:auto;font-weight:500;font-style:normal">
                    <span>{{ role }}</span>
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
export class RoleDialogComponent {
    availableRoles = ['Admin', 'เจ้าหน้าที่พัศดุ', 'ผู้อำนวยการ', 'เจ้าหน้าที่ตรวจนับ', 'เจ้าหน้าที่ทั่วไป'];
    selectedRole: string;
  
    constructor(
      public dialogRef: MatDialogRef<RoleDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.selectedRole = data?.roles || '';
    }
  
    onCancel(): void {
      this.dialogRef.close();
    }
  
    onSave(): void {
      this.dialogRef.close(this.selectedRole);
    }
}
