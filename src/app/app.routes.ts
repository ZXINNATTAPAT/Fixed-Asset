import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';

// 🔐 กำหนดกลุ่มบทบาท
const fullAccessRoles = ['Admin', 'เจ้าหน้าที่พัสดุ'];
const dashboardRoles = ['Admin', 'เจ้าหน้าที่พัสดุ', 'ผู้อำนวยการ'];
const mainSystemRoles = ['Admin', 'เจ้าหน้าที่พัสดุ'];
const subSystemRoles = ['Admin', 'เจ้าหน้าที่พัสดุ', 'เจ้าหน้าที่ทั่วไป', 'เจ้าหน้าที่ฝ่ายอำนวยการ'];
const inventoryCycleRoles = ['Admin', 'เจ้าหน้าที่พัสดุ', 'เจ้าหน้าที่ตรวจนับ'];
const userManagementRoles = ['Admin', 'เจ้าหน้าที่พัสดุ'];
const assetTableRoles = ['Admin', 'เจ้าหน้าที่พัสดุ', 'เจ้าหน้าที่ทั่วไป', 'เจ้าหน้าที่ฝ่ายอำนวยการ', 'ผู้อำนวยการ', 'เจ้าหน้าที่ตรวจนับ'];
const dataManagerRoles = ['Admin', 'เจ้าหน้าที่จัดการข้อมูล', 'เจ้าหน้าที่พัสดุ'];

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
        data: { roles: dashboardRoles }
      },
      {
        path: 'usersmanagement',
        loadComponent: () =>
          import('../components/main_system/user-management/user-management.component')
            .then((m) => m.UserManagementComponent),
        canActivate: [AuthGuard],
        data: { title: 'usersmanagement', roles: userManagementRoles }
      },
      {
        path: 'inventorycycle',
        loadComponent: () =>
          import('../components/sub_system/assetcount/asset-inventory-cycle/asset-inventory-cycle.component')
            .then((m) => m.AssetInventoryCycleComponent),
        canActivate: [AuthGuard],
        data: { title: 'inventorycycle', roles: inventoryCycleRoles }
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
        data: { roles: mainSystemRoles }
      },
      {
        path: 'system/sub',
        loadChildren: () => import('../components/sub_system/routes').then((m) => m.routes),
        canActivate: [AuthGuard],
        data: { roles: subSystemRoles }
      },
      {
        path: 'table',
        loadChildren: () =>
          Promise.all([
            import('../components/main_system/routes'),
            import('../components/sub_system/routes')
          ]).then(([m1, m2]) => [...m1.routes, ...m2.routes]),
        canActivate: [AuthGuard],
        data: { roles: fullAccessRoles } // ไม่รวมเจ้าหน้าที่ทั่วไป
      },
      {
        path: 'table/assettable',
        loadComponent: () =>
          import('../components/main_system/asset-table/asset-table.component')
            .then((m) => m.AssetTableComponent),
        canActivate: [AuthGuard],
        data: { title: 'Asset Table', roles: assetTableRoles }
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
