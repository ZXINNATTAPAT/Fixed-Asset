import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-assettype-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogContent,
  ],
  template: `
  <mat-dialog-content>
    <h2 mat-dialog-title>แก้ไขประเภทสินทรัพย์</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field class="w-100">
        <mat-label>รหัสประเภท</mat-label>
        <input matInput formControlName="TypeCode">
      </mat-form-field>
      <mat-form-field class="w-100">
        <mat-label>ชื่อประเภท</mat-label>
        <input matInput formControlName="TypeName">
      </mat-form-field>
      <div class="mt-4 text-end">
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">บันทึก</button>
        <button mat-button type="button" (click)="dialogRef.close()">ยกเลิก</button>
      </div>
    </form>
    </mat-dialog-content>
  `,
  styles: [`.w-100 { width: 100%; }`]
})
export class EditAssettypeDialogComponent {
  form: FormGroup;

  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<EditAssettypeDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  constructor() {
    this.form = this.fb.group({
      TypeId: [this.data.TypeId],
      TypeCode: [this.data.TypeCode, Validators.required],
      TypeName: [this.data.TypeName, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
