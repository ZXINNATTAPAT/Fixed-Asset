import { Routes } from '@angular/router';
import { AssetDetails3Component } from './asset-details3/asset-details3.component';
import { AssetDetails2Component } from './asset-details2/asset-details2.component';
import { SystemComponent } from './asset-detail1/system.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./asset-table/asset-table.component').then(
        (m) => m.AssetTableComponent
      ),
    data: {
      title: 'Asset-table',
    },
  },
  {
    path: '',
    data: {
      title: '',
    },
    children: [
      {
        path: 'AssetDetails',
        loadComponent: () =>
          import('./asset-detail1/system.component').then(
            (m) => m.SystemComponent
          ),
        data: {
          title: 'เพิ่มรายการครุภัณท์',
        },
      },
      {
        path: 'AssetDetails2',
        loadComponent: () =>
          import('./asset-details2/asset-details2.component').then(
            (m) => m.AssetDetails2Component
          ),
        data: {
          title: 'AssetDetails2',
        },
      },
      {
        path: 'AssetDetails3',
        loadComponent: () =>
          import('./asset-details3/asset-details3.component').then(
            (m) => m.AssetDetails3Component
          ),
        data: {
          title: 'AssetDetails3',
        },
      },

      {
        path: 'Editasset/:assetId',
        loadComponent: () =>
          import('./editasset-detail/editasset-detail.component').then(
            (m) => m.EditassetDetailComponent
          ),
        data: {
          title: 'Edit-Asset',
        },
      },
      {
        path: 'infoasset/:assetId',
        loadComponent: () =>
          import('./infoasset/infoasset.component').then(
            (m) => m.InfoassetComponent
          ),
        data: {
          title: 'Info-Asset',
        },
      },

      // {
      //   path: 'form-step-1',
      //   loadChildren: () => import('./asset-detail1/system.component').then(m => m.SystemComponent),
      //   data: {
      //     title: 'AssetDetails'
      //   }
      // },
      // {
      //   path: 'form-step-2',
      //   loadChildren: () => import('./asset-details2/asset-details2.component').then(m => m.AssetDetails2Component),
      //   data: {
      //     title: 'AssetDetails2'
      //   }
      // },
      // {
      //   path: 'form-step-3',
      //   loadChildren: () => import('./asset-details3/asset-details3.component').then(m => m.AssetDetails3Component),
      //   data: {
      //     title: 'AssetDetails3'
      //   }
      // }
    ],
  },
];
