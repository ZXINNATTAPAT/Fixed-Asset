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
import {  cilPencil, cilTrash } from '@coreui/icons';
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
import { ApiService } from '../../../ApiController/apiservice/api-service.service';


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

  constructor(private dialog: MatDialog,private ap :ApiService) { }

  ngOnInit(): void {this.getUsers();}
  
  editUser(user: any): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '1000px',
      height: '500px',
      data: { ...user } // Pass the user data to the dialog
    });
  
    dialogRef.afterClosed().subscribe((updatedUser) => {
      if (updatedUser) {
        this.ap.assetService.updateData(`https://localhost:7204/api/Users/${user.userId}`, updatedUser)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'ข้อมูลอัปเดตเรียบร้อยแล้ว',
            });
            this.refreshData(); // Refresh the user list
          })
          .catch((error) => {
            console.error('Error updating user:', error);
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้',
            });
          });
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
    this.ap.assetService.fetchData('users/GetUserFull').subscribe(data => {
      this.userDetails = data.sort((a: any, b: any) => {
        // ให้ Admin ขึ้นก่อน
        if (a.Role === 'Admin' && b.Role !== 'Admin') return -1;
        if (a.Role !== 'Admin' && b.Role === 'Admin') return 1;
        return 0; // บทบาทอื่นไม่เปลี่ยนลำดับ
      });
  
      this.dataSource = new MatTableDataSource<any>(this.userDetails);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  
  searchValue: string = '';

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  clearSearch(): void {
    this.dataSource.filter = '';
  }

  refreshData(): void {
    this.getUsers(); // โหลดข้อมูลใหม่
  }

  // Function to update the user role with confirmation
  updateUserRole(userId: number, roleObj: { roleId: number, roleName: string }): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการเปลี่ยนบทบาทผู้ใช้นี้เป็น "${roleObj.roleName}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ap.assetService.updateData2(`Roles/${userId}/role/${roleObj.roleId}`, null)
          .then(() => {
            const userIndex = this.userDetails.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
              this.userDetails[userIndex].roles = roleObj.roleName;
            }
            this.dataSource.data = [...this.userDetails]; // Refresh the table
            Swal.fire({
              icon: 'success',
              title: 'อัปเดตบทบาทเรียบร้อยแล้ว',
            });
          })
          .catch((error) => {
            console.error('Error updating role:', error);
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถแก้ไขบทบาทได้',
            });
          });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'การเปลี่ยนบทบาทถูกยกเลิก',
        });
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
  
    dialogRef.afterClosed().subscribe((selectedRole: any) => {
      const currentRoleName = typeof user.roles === 'string' ? user.roles : user.roles?.roleName;
      if (selectedRole && selectedRole.roleName !== currentRoleName) {
        this.updateUserRole(user.UserId, selectedRole);
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
        this.ap.assetService.deleteData(`users/${user.id}`)
          .then(() => {
            this.userDetails = this.userDetails.filter(u => u.id !== user.id);
            this.dataSource.data = this.userDetails;
            Swal.fire('ลบแล้ว!', 'ผู้ใช้ของคุณถูกลบแล้ว', 'success');
          })
          .catch((error) => {
            console.error('Error deleting user:', error);
            Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดขณะทำการลบผู้ใช้', 'error');
          });
      } else {
        Swal.fire('ยกเลิกแล้ว', 'ข้อมูลผู้ใช้ของคุณปลอดภัย :)', 'info');
      }
    });
  }

  getButtonClass(roleName: string): string {
    return this.ap.role.getRoleClass(roleName);
  }
  
}
