import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard], // ✅ ใช้ AuthGuard ที่ Main Layout
    data: { title: 'Home' },
    children: [
      {
        path: 'dashboard/ส่วนกลาง',
        loadChildren: () =>
          import('./dashboard/routes').then((m) => m.routes),
        canActivate: [AuthGuard], // ✅ ป้องกันเฉพาะ Role
        data: { roles: ['Admin', 'เจ้าหน้าที่ฝ่ายอำนวยการ'] }
      },
      {
        path: 'dashboard/ส่วนภูมิภาค',
        loadChildren: () =>
          import('./dashboard/routes').then((m) => m.routes),
        canActivate: [AuthGuard], // ✅ ป้องกันเฉพาะ Role
        data: { roles: ['Admin', 'RegionalOfficer'] }
      },
      {
        path: 'usersmanagement',
        loadComponent: () =>
          import('./main_system/user-management/user-management.component')
          .then((m) => m.UserManagementComponent),
        canActivate: [AuthGuard], // ✅ ป้องกันเฉพาะ Role
        data: { title: 'usersmanagement', roles: ['Admin'] }
      },
      {
        path: 'defaultdata',
        loadChildren: () =>
          import('./defaultdata/routes').then((m) => m.routes),
        canActivate: [AuthGuard], // ✅ ป้องกันเฉพาะ Role
        data: { roles: ['Admin', 'DataManager'] }
      },
      {
        path: 'system/main',
        loadChildren: () =>
          import('./main_system/routes').then((m) => m.routes),
        canActivate: [AuthGuard], // ✅ เพิ่ม AuthGuard
        data: { roles: ['Admin', 'เจ้าหน้าที่ฝ่ายอำนวยการ'] }
      },
      {
        path: 'system/sub',
        loadChildren: () =>
          import('./sub_system/routes').then((m) => m.routes),
        canActivate: [AuthGuard], // ✅ เพิ่ม AuthGuard
        data: { roles: ['Admin', 'เจ้าหน้าที่ฝ่ายอำนวยการ'] }
      },
      {
        path: 'table',
        loadChildren: () =>
          Promise.all([
            import('./main_system/routes'),
            import('./sub_system/routes')
          ]).then(([m1, m2]) => [...m1.routes, ...m2.routes]), // ✅ รวม routes
        canActivate: [AuthGuard], // ✅ ป้องกันหน้าด้วย AuthGuard
        data: { roles: ['Admin', 'เจ้าหน้าที่ฝ่ายอำนวยการ'] }
      },
      
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/routes').then((m) => m.routes),
      }
    ]
  },  
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component')
      .then((m) => m.LoginComponent),
    data: {title: 'Login'},
  },
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component')
      .then((m) => m.Page404Component),
    data: {title: 'Page 404'},
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component')
      .then((m) => m.Page500Component),
    data: {title: 'Page 500'},
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
export class AppRoutingModule {
  
}
