import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-countingunit-dialog',
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
    <h1 mat-dialog-title>แก้ไขหน่วยนับ</h1>
    <div mat-dialog-content>
      <form [formGroup]="editForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>รหัสหน่วยนับ</mat-label>
          <input matInput formControlName="unitCode" />
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>ชื่อหน่วยนับ</mat-label>
          <input matInput formControlName="unitName" />
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
export class EditCountingUnitDialogComponent {
  editForm: FormGroup;

  private dialogRef = inject(MatDialogRef<EditCountingUnitDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  constructor() {
    this.editForm = this.fb.group({
      unitCode: [this.data.unitCode, Validators.required],
      unitName: [this.data.unitName, Validators.required],
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