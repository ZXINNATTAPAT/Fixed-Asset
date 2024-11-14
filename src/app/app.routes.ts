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
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'assettable',
        loadChildren: () =>
          import('./views/system/routes').then((m) => m.routes),
      },
      {
        path: 'defaultdata',
        loadChildren: () =>
          import('./views/defaultdata/routes').then((m) => m.routes),
      },
      {
        path: 'usersmanagement',
        loadComponent: () => import('../app/views/system/user-management/user-management.component').then(
          (m) => m.UserManagementComponent
        ),
        data: {
          title: 'usersmanagement'
        }
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/routes').then((m) => m.routes),
      },
      {
        path: 'system',
        loadChildren: () =>
          import('./views/system/routes').then((m) => m.routes),
      },
      {
        path: 'system',
        loadChildren: () =>
          import('./views/system2/routes').then((m) => m.routes),
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
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component
      ),
    data: {
      title: 'Page 404',
    },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component
      ),
    data: {
      title: 'Page 500',
    },
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
