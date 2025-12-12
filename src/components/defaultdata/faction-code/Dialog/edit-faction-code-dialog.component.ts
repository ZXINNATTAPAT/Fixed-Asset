import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-faction-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,MatSelectModule,
    MatDialogContent
  ],
  template: `
  <form [formGroup]="editForm" (ngSubmit)="onSave()" class="dialog-form">
    <h2 mat-dialog-title>แก้ไขข้อมูลฝ่าย</h2>

    <mat-dialog-content class="dialog-content">
      <div class="row g-3">

        <div class="col-md-6">
          <label for="factionCodeInput" class="form-label">รหัสฝ่าย</label>
          <input matInput formControlName="Code" id="factionCodeInput" placeholder="ระบุรหัสฝ่าย" class="form-control" />
        </div>

        <div class="col-md-6">
          <label for="factionNameInput" class="form-label">ชื่อฝ่าย</label>
          <input matInput formControlName="Name" id="factionNameInput" placeholder="ระบุชื่อฝ่าย" class="form-control" />
        </div>

        <div class="col-md-6">
          <label for="factionSeminInput" class="form-label">ชื่อย่อ</label>
          <input matInput formControlName="Semin" id="factionSeminInput" placeholder="ระบุชื่อย่อ" class="form-control" />
        </div>

        <div class="col-md-6">
          <label for="deptSelect" class="form-label">สำนัก</label>
          <mat-form-field appearance="fill" style="width: 100%;">
            <mat-label>เลือกสำนัก (Department)</mat-label>
            <mat-select formControlName="DeptId" required>
              <mat-option *ngFor="let dept of departments" [value]="dept.DeptId">
                {{ dept.Name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pt-3">
      <button mat-button type="button" (click)="onCancel()">ยกเลิก</button>
      <button mat-raised-button color="primary" type="submit" [disabled]="editForm.invalid">บันทึก</button>
    </mat-dialog-actions>
  </form>
`,
  styles: [`
    .form-label { font-weight: bold; }
  `]
})
export class EditFactionCodeDialogComponent implements OnInit {
  editForm!: FormGroup;
  departments: { DeptId: number; Name: string }[] = [];

  private dialogRef = inject(MatDialogRef<EditFactionCodeDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private api = inject(ApiService); // ดึง service เพื่อโหลด department

  ngOnInit(): void {
    // โหลด department list
    this.api.assetService.fetchData('Departments').subscribe((res: any[]) => {
      this.departments = res.map(d => ({
        DeptId: d.DeptId,
        Name: d.Name
      }));
    });
  
    // โหลดข้อมูลฝ่ายจาก id ที่ส่งมาใน data
    this.editForm = this.fb.group({
      FactId: [this.data.FactId],
      Code: [this.data.Code, Validators.required],
      Name: [this.data.Name, Validators.required],
      Semin: [this.data.Semin, Validators.required],
      DeptId: [this.data.DeptId, Validators.required]
    });
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const id = this.data.FactId;
      const payload = this.editForm.value;
  
      this.api.assetService.updateData2(`Factiontypecodes/${id}`, payload).then(() => {
        this.dialogRef.close(payload); // ส่งข้อมูลใหม่กลับไป
      }).catch(err => {
        console.error('Error updating:', err);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
      });
    }
  }
  
}
