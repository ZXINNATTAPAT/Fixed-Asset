import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'app-user-edit-dialog',
  standalone:true,
  imports:[MatDialogActions,MatSelect,MatOption,
    MatLabel,MatFormField,FormsModule,MatDialogModule,
    MatCommonModule,CommonModule,ReactiveFormsModule,
    MatDialogContent,MatButtonModule],
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.scss']
})
export class UserEditDialogComponent {
  userForm: FormGroup;

  roles = ['Admin', 'เจ้าหน้าที่พัศดุ', 'ผู้อำนวยการ', 'เจ้าหน้าที่ตรวจนับ', 'เจ้าหน้าที่ทั่วไป'];

  constructor(
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      codeId: [data.codeId, Validators.required],
      username: [data.username, [Validators.required, Validators.email]],
      prefix: [data.prefix, Validators.required],
      sname: [data.sname, Validators.required],
      lname: [data.lname, Validators.required],
      password: [data.password, Validators.required],
      position: [data.position, Validators.required],
      subposition: [data.subposition],
      workgroup: [data.workgroup, Validators.required],
      affiliation: [data.affiliation, Validators.required],
      positiontype: [data.positiontype, Validators.required],
      enrollmentDate: [data.enrollmentDate, Validators.required],
      roles: [data.roles, Validators.required]
    });
  }

  save(): void {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
