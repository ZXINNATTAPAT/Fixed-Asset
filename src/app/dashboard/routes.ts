import { Routes } from '@angular/router';



export const routes: Routes = [
  // {
  //   path: ':id',
  //   loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
  //   data: {
  //     title: $localize`Dashboard`
  //   }
  // },
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    data: {
      title: $localize`Dashboard`
    }
  },
  // {
  //   path: '',
  //   loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
  //   data: {
  //     title: $localize`Dashboard`
  //   },
  //   pathMatch: 'full',
  // },
];

