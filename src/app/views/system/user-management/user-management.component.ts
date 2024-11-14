import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, NgStyle } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  TextColorDirective,
  TableModule,
  UtilitiesModule,
} from '@coreui/angular';
import {
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule, // Example: Add any other required Angular Material modules here
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
    IconDirective,FormDirective, FormLabelDirective, FormControlDirective,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {

  icons = { cilPencil, cilTrash };
  userDetails: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(this.userDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    "actions",
    "รหัสผู้ใช้",
    "ชื่อผู้ใช้",
    "ชื่อ",
    "นามสกุล",
    "ตำแหน่ง",
    "ตำแหน่งย่อย",
    "กลุ่มงาน",
    "บทบาท"
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.http.get<any[]>('https://localhost:7204/api/users').subscribe(data => {
      this.userDetails = data;
      this.dataSource = new MatTableDataSource<any>(this.userDetails);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  editUser(user: any): void {
    // Define the available roles
    const roles = ['SAdmin', 'Admin', 'user']; 
    
    // Use SweetAlert2 to show a dropdown prompt
    Swal.fire({
      title: `แก้ไขบทบาทของ ${user.username}`,
      input: 'select',
      inputOptions: roles.reduce((options, role) => ({ ...options, [role]: role }), {}),
      inputPlaceholder: 'เลือกบทบาท',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedRole = result.value;
  
        // Call API to update user role
        this.updateUserRole(user.id, selectedRole);
      }
    });
  }
  
  // Method to send the updated role to the server
  updateUserRole(userId: number, role: string): void {
    this.http.put(`https://localhost:7204/api/users/${userId}`, { roles: role })
      .subscribe(
        response => {
          // Update user role in the local list to reflect the change immediately
          const user = this.userDetails.find(u => u.id === userId);
          if (user) user.roles = role;
          this.dataSource.data = [...this.userDetails]; // Update table data
  
          Swal.fire({
            title: 'อัปเดตสำเร็จ',
            text: `บทบาทผู้ใช้ถูกอัปเดตเป็น ${role}`,
            icon: 'success'
          });
        },
        error => {
          console.error('Error updating user role:', error);
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอัปเดตบทบาทของผู้ใช้ได้',
            icon: 'error'
          });
        }
      );
  }

  deleteUser(user: any): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบผู้ใช้นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`https://localhost:7204/api/users/${user.id}`).subscribe(
          () => {
            this.userDetails = this.userDetails.filter(u => u.id !== user.id);
            this.dataSource.data = this.userDetails;
            Swal.fire('ลบแล้ว!', 'ผู้ใช้ของคุณถูกลบแล้ว', 'success');
          },
          (error) => {
            console.error('เกิดข้อผิดพลาดในการลบผู้ใช้:', error);
            Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบผู้ใช้', 'error');
          }
        );
      } else {
        Swal.fire('ยกเลิกแล้ว', 'ข้อมูลผู้ใช้ของคุณปลอดภัย :)', 'info');
      }
    });
  }
}
