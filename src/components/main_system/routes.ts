import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'assettable',
    loadComponent: () =>
      import('./asset-table/asset-table.component').then(
        (m) => m.AssetTableComponent
      ),
    data: {title: 'Asset-table'},
    pathMatch: 'full', 
  },
  {
    path: '',
    data: {title: ''},
    children: [
      {
        path: 'assetDetails',
        loadComponent: () =>
          import('./asset-detail1/system.component').then(
            (m) => m.SystemComponent
          ),
        data: {title: 'เพิ่มรายการครุภัณท์'},
      },
      {
        path: 'assettable',
        loadComponent: () =>
          import('./asset-table/asset-table.component').then(
            (m) => m.AssetTableComponent
          ),
        data: {title: 'ตารางสินทรัพย์ทั้งหมด'},
      },
      {
        path: 'assetDetails2',
        loadComponent: () =>
          import('./asset-details2/asset-details2.component').then(
            (m) => m.AssetDetails2Component
          ),
        data: {title: 'AssetDetails2'},
      },
      {
        path: 'assetDetails3',
        loadComponent: () =>
          import('./asset-details3/asset-details3.component').then(
            (m) => m.AssetDetails3Component
          ),
        data: {title: 'AssetDetails3'},
      },
      {
        path: 'Editasset/:assetId',
        loadComponent: () =>
          import('./editasset-detail/editasset-detail.component').then(
            (m) => m.EditassetDetailComponent
          ),
        data: {title: 'Edit-Asset'},
      },
      {
        path: 'infoasset/:assetId',
        loadComponent: () =>
          import('./infoasset/infoasset.component').then(
            (m) => m.InfoassetComponent
          ),
        data: {title: 'Info-Asset'},
      },

    ],
  },
];
