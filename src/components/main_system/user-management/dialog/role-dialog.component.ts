import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatOption, MatSelect } from '@angular/material/select';
import { ApiService } from 'src/ApiController/apiservice/api-service.service';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [MatSelect,MatOption,MatDialogModule,CommonModule,MatCommonModule,MatButton,FormsModule],
  template: `
    <h1 mat-dialog-title class="anuphan-600">เปลี่ยนบทบาท</h1>
    <div mat-dialog-content>
      <div class="form-control anuphan-600">
        <mat-select [(ngModel)]="selectedRole" placeholder="เลือกบทบาท">
          <mat-option *ngFor="let role of availableRoles" [value]="role.RoleName">
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
  selectedRole: string = '';

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ap : ApiService,
  ) {
    this.selectedRole = data?.roles || '';
  }

  ngOnInit(): void {
    this.ap.role.loadRoles().subscribe(roles => {
      this.availableRoles = roles;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.selectedRole);
  }
}
