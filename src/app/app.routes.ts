import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';

// 🔐 กลุ่มบทบาท (ภาษาไทย)
const fullAccessRoles = ['Admin', 'เจ้าหน้าที่ฝ่ายพัสดุ'];
const adminAndDirectorRoles = ['Admin', 'เจ้าหน้าที่ฝ่ายอำนวยการ'];
const regionalRoles = ['Admin', 'เจ้าหน้าที่ฝ่ายภูมิภาค'];
const dataManagerRoles = ['Admin', 'เจ้าหน้าที่จัดการข้อมูล'];
const generalStaffRoles = ['Admin', 'เจ้าหน้าที่ทั่วไป'];

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: { title: 'Home' },
    children: [
      {
        path: 'dashboard/ส่วนกลาง',
        loadChildren: () => import('../components/dashboard/routes').then((m) => m.routes),
        canActivate: [AuthGuard],
        data: { roles: adminAndDirectorRoles }
      },
      // {
      //   path: 'dashboard/ส่วนภูมิภาค',
      //   loadChildren: () => import('./dashboard/routes').then((m) => m.routes),
      //   canActivate: [AuthGuard],
      //   // data: { roles: regionalRoles }
      // },
      {
        path: 'usersmanagement',
        loadComponent: () =>
          import('../components/main_system/user-management/user-management.component')
            .then((m) => m.UserManagementComponent),
        canActivate: [AuthGuard],
        data: { title: 'usersmanagement', roles: ['Admin'] }
      },
      {
        path: 'defaultdata',
        loadChildren: () => import('../components/defaultdata/routes').then((m) => m.routes),
        canActivate: [AuthGuard],
        data: { roles: dataManagerRoles }
      },
      {
        path: 'system/main',
        loadChildren: () => import('../components/main_system/routes').then((m) => m.routes),
        canActivate: [AuthGuard],
        data: { roles: fullAccessRoles.concat(adminAndDirectorRoles) }
      },
      {
        path: 'system/sub',
        loadChildren: () => import('../components/sub_system/routes').then((m) => m.routes),
        canActivate: [AuthGuard],
        data: { roles: fullAccessRoles.concat(adminAndDirectorRoles) }
      },
      {
        path: 'table',
        loadChildren: () =>
          Promise.all([
            import('../components/main_system/routes'),
            import('../components/sub_system/routes')
          ]).then(([m1, m2]) => [...m1.routes, ...m2.routes]),
        canActivate: [AuthGuard],
        data: { roles: fullAccessRoles.concat(adminAndDirectorRoles) } // ⛔ ไม่มี 'เจ้าหน้าที่ทั่วไป'
      },
      
      // ✅ แยก route เฉพาะหน้า Asset Table ให้เจ้าหน้าที่ทั่วไปเข้าถึงได้
      {
        path: 'table/assettable',
        loadComponent: () =>
          import('../components/main_system/asset-table/asset-table.component')
            .then((m) => m.AssetTableComponent),
        canActivate: [AuthGuard],
        data: {
          title: 'Asset Table',
          roles: ['Admin', 'เจ้าหน้าที่ฝ่ายพัสดุ', 'เจ้าหน้าที่ทั่วไป', 'เจ้าหน้าที่ฝ่ายอำนวยการ']
        }
      },
      {
        path: 'pages',
        loadChildren: () => import('../components/views/pages/routes').then((m) => m.routes),
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../components/views/pages/login/login.component')
        .then((m) => m.LoginComponent),
    data: { title: 'Login' },
  },
  {
    path: '404',
    loadComponent: () =>
      import('../components/views/pages/page404/page404.component')
        .then((m) => m.Page404Component),
    data: { title: 'Page 404' },
  },
  {
    path: '500',
    loadComponent: () =>
      import('../components/views/pages/page500/page500.component')
        .then((m) => m.Page500Component),
    data: { title: 'Page 500' },
  },
  {
    path: '**',
    redirectTo: '404',
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
