import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-session-dialog',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule,MatFormField,MatButtonModule,MatDialogModule],
  templateUrl: './edit-session-dialog.component.html',
  styleUrl: './edit-session-dialog.component.scss'
})
export class EditSessionDialogComponent implements OnInit {

  editForm!: FormGroup; // ✅ ใช้ `!` เพื่อให้ TypeScript รู้ว่าค่าจะถูกกำหนดใน `ngOnInit()`

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("Received data:", this.data); // ✅ Debug เพื่อตรวจสอบค่าที่ได้รับ
  }

  ngOnInit() {
    if (!this.data || !this.data.session) {
      console.error("Error: No session data received!");
      this.dialogRef.close();
      return;
    }

    this.initForm();
  }

  private initForm() {
    this.editForm = this.fb.group({
      SessionName: [this.data.session?.SessionName || '', Validators.required],
      Date: [this.data.session?.Date || '', Validators.required],
      VerifierId: [this.data.session?.VerifierId || '', Validators.required],
      Inspectors: this.fb.array(
        this.data.session?.Inspectors?.map((inspector: any) => this.fb.group({
          InspectorId: [inspector.InspectorId, Validators.required]
        })) || []
      ) as FormArray // ✅ บอก TypeScript ว่านี่คือ `FormArray`
    });
  }

  get inspectorsArray(): FormArray {
    return this.editForm.get('Inspectors') as FormArray; // ✅ ใช้ Getter ป้องกัน Error
  }

  // 🔹 เมื่อกดบันทึก
  save() {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  // 🔹 เมื่อกดยกเลิก
  close() {
    this.dialogRef.close();
  }
}
