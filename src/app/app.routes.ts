import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Login Page',
    },
  },
  {
    path: 'mainpage',
    loadComponent: () =>
      import('./views/pages/mainpage/mainpage.component').then(
        (m) => m.MainpageComponent
      ),
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard], // ใช้ AuthGuard เพื่อตรวจสอบ Token
    data: {title: 'Home',},
    children: [
      // {
      //   path: 'dashboard/ส่วนกลาง/:fid/:sid',
      //   loadChildren: () =>
      //     import('./dashboard/routes').then((m) => m.routes),
      // },
      // {
      //   path: 'dashboard/ส่วนภูมิภาค/:fid/:sid',
      //   loadChildren: () =>
      //     import('./dashboard/routes').then((m) => m.routes),
      // },
      {
        path: 'dashboard/ส่วนกลาง',
        loadChildren: () =>
          import('./dashboard/routes').then((m) => m.routes),
          data: { roles: ['Admin', 'AssetOfficer'] } // เฉพาะ Admin & เจ้าหน้าที่พัสดุ
      },
      {
        path: 'dashboard/ส่วนภูมิภาค',
        loadChildren: () =>
          import('./dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'table',
        loadChildren: () =>
          import('./main_system/routes').then((m1) =>
            import('./sub_system/routes').then(
              (m2) => [...m1.routes, ...m2.routes])
          ),
      },      
      {
        path: 'defaultdata',
        loadChildren: () =>
          import('./defaultdata/routes').then((m) => m.routes),
      },
      {
        path: 'usersmanagement',
        loadComponent: () => import('./main_system/user-management/user-management.component')
        .then((m) => m.UserManagementComponent),
        data: {title: 'usersmanagement'}
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/routes').then((m) => m.routes),
      },
      {
        path: 'system',
        loadChildren: () =>
          import('./main_system/routes').then((m) => m.routes), 
        //เวลาเรียกใช้งานจะเรียกใช้งานจาก main_system
        // system/ . . . หน้า Loadchildren
      },
      {
        path: 'system',
        loadChildren: () =>
          import('./sub_system/routes').then((m) => m.routes),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/routes').then((m) => m.routes),
      },
      
    ],
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
export class AppRoutingModule {}
