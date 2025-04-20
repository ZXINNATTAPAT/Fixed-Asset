import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';

@Component({
  selector: 'app-user-edit-dialog',
  standalone:true,
  imports:[MatDialogActions,MatSelect,MatOption,MatLabel,
    MatFormField,FormsModule,MatDialogModule,MatCommonModule,
    CommonModule,ReactiveFormsModule,MatDialogContent,MatButtonModule],
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.scss']
})

export class UserEditDialogComponent {
  userForm: FormGroup;

  roles = ['Admin', 'เจ้าหน้าที่พัศดุ', 'ผู้อำนวยการ', 'เจ้าหน้าที่ตรวจนับ', 'เจ้าหน้าที่ทั่วไป'];
  public data: any = inject(MAT_DIALOG_DATA);
  constructor(
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    private fb: FormBuilder,
    private ap: ApiService // Inject HttpClient
  ) {
    this.userForm = this.fb.group({
      codeId: [this.data.codeId, Validators.required],
      username: [this.data.username, [Validators.required, Validators.email]],
      prefix: [this.data.prefix, Validators.required],
      sname: [this.data.sname, Validators.required],
      lname: [this.data.lname, Validators.required],
      password: [this.data.password, Validators.required],
      position: [this.data.position, Validators.required],
      subposition: [this.data.subposition],
      workgroup: [this.data.workgroup, Validators.required],
      affiliation: [this.data.affiliation, Validators.required],
      positiontype: [this.data.positiontype, Validators.required],
      enrollmentDate: [this.data.enrollmentDate, Validators.required],
      roles: [this.data.roles, Validators.required]
    });
  }

  save(): void {
    if (this.userForm.valid) {
      const apiUrl = 'users'; // Replace with your API endpoint
      this.ap.assetService.updateData(apiUrl, this.userForm.value).then((response) => {
        console.log('User saved successfully:', response);
        this.dialogRef.close(this.userForm.value);
      }).catch((error) => {
        console.error('Error saving user:', error);
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
