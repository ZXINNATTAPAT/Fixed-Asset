import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-faction-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1 mat-dialog-title>แก้ไขข้อมูลฝ่าย</h1>
    <div mat-dialog-content>
      <form [formGroup]="editForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>รหัสฝ่าย</mat-label>
          <input matInput formControlName="FactionCode" />
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>ชื่อฝ่าย</mat-label>
          <input matInput formControlName="FactionName" />
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>ชื่อสำนัก</mat-label>
          <input matInput formControlName="DepartmentName" />
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">ยกเลิก</button>
      <button mat-button [disabled]="editForm.invalid" (click)="onSave()">บันทึก</button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class EditFactionCodeDialogComponent {
  editForm: FormGroup;

  private dialogRef = inject(MatDialogRef<EditFactionCodeDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  constructor() {
    this.editForm = this.fb.group({
      FactionCode: [this.data.FactionCode, Validators.required],
      FactionName: [this.data.FactionName, Validators.required],
      DepartmentName: [this.data.DepartmentName, Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }
}