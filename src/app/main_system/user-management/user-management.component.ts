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
import { MatOption } from '@angular/material/core';
import { MatLabel, MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoleDialogComponent } from './dialog/role-dialog.component';
import { UserEditDialogComponent } from './dialog/user-edit-dialog/user-edit-dialog.component'
import { MatIcon } from '@angular/material/icon';
import { AddUserDialogComponent } from './dialog/add-user-dialog/add-user-dialog.component';


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
    MatButtonModule, 
    UtilitiesModule,
    ButtonDirective,
    MatOption,
    MatSelect,MatIcon,MatLabel,
    MatDialogModule,
    NgStyle,
    IconDirective,FormDirective, FormLabelDirective, FormControlDirective,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {

  availableRoles: string[] = ["Admin", "เจ้าหน้าที่พัศดุ", "ผู้อำนวยการ", "เจ้าหน้าที่ตรวจนับ", "เจ้าหน้าที่ทั่วไป"];

  icons = { cilPencil, cilTrash };
  userDetails: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(this.userDetails);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(AddUserDialogComponent) addUserDialog!: AddUserDialogComponent;

  displayedColumns: string[] = [
    "การกระทำ",
    // "รหัสผู้ใช้",
    "ชื่อผู้ใช้",
    "ชื่อ",
    "นามสกุล",
    "ตำแหน่ง",
    "ตำแหน่งย่อย",
    // "กลุ่มงาน",
    "สังกัด",
    "ประเภทตำแหน่ง",
    "ระดับตำแหน่ง",
    "สำนัก",
    "ฝ่าย",
    "บทบาท"
  ];

  constructor(private http: HttpClient,private dialog: MatDialog) { }

  ngOnInit(): void {this.getUsers();}
  
  editUser(user: any): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '1000px',
      height: '500px',
      data: { ...user } // Pass the user data to the dialog
    });
  
    dialogRef.afterClosed().subscribe((updatedUser) => {
      if (updatedUser) {
        // Call API to update user details
        this.http.put(`https://localhost:7204/api/Users/${user.id}`, updatedUser).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'ข้อมูลอัปเดตเรียบร้อยแล้ว',
            });
            this.getUsers(); // Refresh the user list
          },
          (error) => {
            console.error('Error updating user:', error);
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้',
            });
          }
        );
      }
    });
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '1000px',
      height: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ ผู้ใช้ถูกเพิ่ม:', result);
      }
    });
  }
  
  getUsers(): void {
    this.http.get<any[]>('https://localhost:7204/api/users/GetUserFull').subscribe(data => {
      this.userDetails = data;
      this.dataSource = new MatTableDataSource<any>(this.userDetails);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // console.log(this.userDetails);
    });
  }
  searchValue: string = '';

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchValue; // กรองข้อมูลใน MatTableDataSource
  }

  clearSearch(): void {
    this.searchValue = '';
    this.dataSource.filter = ''; // รีเซ็ตการกรองข้อมูล
  }

  refreshData(): void {
    this.getUsers(); // โหลดข้อมูลใหม่
  }

  // Function to update the user role with confirmation
  updateUserRole(userId: number, role: string): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการเปลี่ยนบทบาทผู้ใช้นี้เป็น "${role}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.patch(`https://localhost:7204/api/Users/${userId}/role`, JSON.stringify(role), {
          headers: { 'Content-Type': 'application/json' },
        }).subscribe(
          () => {
            // อัปเดตบทบาทใน userDetails
            const userIndex = this.userDetails.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
              this.userDetails[userIndex].roles = role;
            }

            // รีเฟรช dataSource
            this.dataSource.data = [...this.userDetails];

            Swal.fire({
              icon: 'success',
              title: 'อัปเดตบทบาทเรียบร้อยแล้ว',
            });
          },
          (error) => {
            console.error('Error updating role:', error);
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถแก้ไขบทบาทได้',
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'info',
          title: 'การเปลี่ยนบทบาทถูกยกเลิก',
        });
      }
    });
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

  openRoleDialog(user: any): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '600px',
      height: '400px',
      data: {
        availableRoles: this.availableRoles,
        currentRole: user.roles
      }
    });
  
    dialogRef.afterClosed().subscribe((selectedRole: string) => {
      if (selectedRole) {
        this.updateUserRole(user.id, selectedRole);
      }
    });
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'Admin':
        return 'btn-outline-danger'; // สีแดง
      case 'เจ้าหน้าที่พัสดุ':
        return 'btn-outline-primary'; // สีน้ำเงิน
      case 'ผู้อำนวยการ':
        return 'btn-outline-warning'; // สีเหลือง
      case 'เจ้าหน้าที่ตรวจนับ':
        return 'btn-outline-success'; // สีเขียว
      case 'เจ้าหน้าที่ทั่วไป':
        return 'btn-outline-info'; // สีฟ้า
      default:
        return 'btn-outline-secondary'; // สีเทา
    }
  }
  
}
