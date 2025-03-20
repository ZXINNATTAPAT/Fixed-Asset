import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogModule,
    CommonModule,
    MatButtonModule,FormsModule,ReactiveFormsModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {

  roles = ['Admin', 'เจ้าหน้าที่พัศดุ', 'ผู้อำนวยการ', 'เจ้าหน้าที่ตรวจนับ', 'เจ้าหน้าที่ทั่วไป'];
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddUserDialogComponent>, // Inject DialogRef
    @Inject(MAT_DIALOG_DATA) public data: any // Inject Data (optional)
  ) {
    this.userForm = this.fb.group({
      userid: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      prefix: ['', Validators.required],
      sname: ['', Validators.required],
      lname: ['', Validators.required],
      password: ['', Validators.required],
      position: ['', Validators.required],
      subposition: [''],
      workgroup: ['', Validators.required],
      affiliation: ['', Validators.required],
      positiontype: ['', Validators.required],
      enrollmentDate: ['', Validators.required],
      roles: ['', Validators.required]
    });
  }

  submitForm() {
    if (this.userForm.valid) {
      console.log("✅ User Data:", this.userForm.value);
      this.dialogRef.close(this.userForm.value);
    }
  } // ปิด Dialog และส่งข้อมูลกลับไป

  closeDialog() {this.dialogRef.close(); } // ปิด Dialog
}
