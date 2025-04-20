import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../../../ApiController/apiservice/api-service.service';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';


interface Role {
  RoleId: number;
  RoleName: string;
}
@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatNativeDateModule,
    MatDatepickerInput,
    MatLabel, MatDatepickerInput, MatFormFieldModule, MatInputModule,
    MatFormFieldModule, MatSelect, MatOption, MatFormField,
    CommonModule,
    MatButtonModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {

  roles: Role[] = []; // เปลี่ยนจาก static เป็น dynamic

  userForm: FormGroup;

  departments: any[] = [];

  factions: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    private ap: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      userId: [0],
      username: ['', [Validators.required, Validators.email]],
      prefix: ['', Validators.required],
      sname: ['', Validators.required],
      lname: ['', Validators.required],
      password: ['',Validators.required],
      position: ['', Validators.required],
      subposition: [''],
      departmentId: [0, Validators.required],
      factionId: [0, Validators.required],
      affiliation: ['', Validators.required],
      positiontype: ['', Validators.required],
      leveltype: ['', Validators.required],
      enrollmentDate: [new Date()],
      roleId: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.loadDepartments();
    this.loadRoles(); 
  }

  loadRoles() {
    this.ap.assetService.fetchData('Roles').subscribe({
      next: (res) => {
        this.roles = res;
        console.log('🎯 ดึง Roles สำเร็จ:', this.roles);
      },
      error: (err) => {
        console.error('❌ ดึง Roles ไม่สำเร็จ:', err);
      }
    });
  }

  loadDepartments() {
    this.ap.assetService.fetchData('Departments')  // เปลี่ยน URL ตาม API ของคุณ
      .subscribe({
        next: (res) => {
          this.departments = res;
        },
        error: (err) => {
          console.error('❌ Failed to load departments:', err);
        }
      });
  }

  onDepartmentChange(deptId: number) {
    const selectedDept = this.departments.find(d => d.DeptId === +deptId);
    this.factions = selectedDept ? selectedDept.Factions : [];
    this.userForm.patchValue({ factionId: 0 }); // reset faction เมื่อเปลี่ยนสำนัก
  }

  submitForm() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
  
      // log ข้อมูลก่อนส่ง
      console.log("✅ Sending to API:", userData);
  
      this.ap.assetService.postData('Users', userData).then((res) => {
        console.log("🎉 POST สำเร็จ:", res);
  
        Swal.fire({
          icon: 'success',
          title: 'เพิ่มผู้ใช้สำเร็จ',
        }).then(() => {
          this.dialogRef.close(res); // ปิด dialog พร้อมส่งข้อมูลกลับ
        });
  
      }).catch((err) => {
        console.error("❌ POST ล้มเหลว:", err);
  
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเพิ่มผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
        });
      });
    }
  }
  

  closeDialog() {
    this.dialogRef.close();
  }
}


