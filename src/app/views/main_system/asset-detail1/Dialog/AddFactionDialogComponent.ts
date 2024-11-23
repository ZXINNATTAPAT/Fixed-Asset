import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-add-faction-dialog',
  standalone:true,
  imports:[MatFormField,MatDialogModule,CommonModule,MatCommonModule,MatButton,FormsModule],
  template: `
    <h1 mat-dialog-title>เพิ่มสถานที่ใหม่</h1>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="newFactionName" placeholder="ระบุสถานที่ตั้ง" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">ยกเลิก</button>
      <button mat-button [disabled]="!newFactionName" (click)="onAdd()">เพิ่ม</button>
    </div>
  `,
})
export class AddFactionDialogComponent {
  newFactionName: string = '';

  constructor(public dialogRef: MatDialogRef<AddFactionDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.dialogRef.close(this.newFactionName);
  }
}
