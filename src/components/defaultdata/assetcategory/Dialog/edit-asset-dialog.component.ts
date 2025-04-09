import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-asset-dialog',
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
    <h1 mat-dialog-title>แก้ไขสินทรัพย์</h1>
    <div mat-dialog-content>
      <form [formGroup]="editForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>รหัสหมวดสินทรัพย์</mat-label>
          <input matInput formControlName="asc_Code" />
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>ชื่อหมวดสินทรัพย์</mat-label>
          <input matInput formControlName="asc_Name" />
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>ชื่อประเภทสินทรัพย์</mat-label>
          <input matInput formControlName="assetCode" />
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
export class EditAssetDialogComponent {
  editForm: FormGroup;

  private dialogRef = inject(MatDialogRef<EditAssetDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  constructor() {
    this.editForm = this.fb.group({
      asc_Code: [this.data.asc_Code, Validators.required],
      asc_Name: [this.data.asc_Name, Validators.required],
      assetCode: [this.data.assetCode, Validators.required],
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