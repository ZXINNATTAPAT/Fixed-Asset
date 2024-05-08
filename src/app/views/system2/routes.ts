import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: ''
    },
    children: [
      {
        path: 'Assetcount',
        loadComponent: () => import('./assetcount/assetcount.component').then(m => m.AssetcountComponent),
        data: {
          title: 'Assetcount'
        }
      },
      {
        path: 'Repair',
        loadComponent: () => import('./repair/repair.component').then(m => m.RepairComponent),
        data: {
          title: 'AssetDetails'
        }
      },
      {
        path: 'sellassets',
        loadComponent: () => import('./sellassets/sellassets.component').then(m => m.SellassetsComponent),
        data: {
          title: 'AssetDetails'
        }
      },
      {
        path: 'disassets',
        loadComponent: () => import('./disassets/disassets.component').then(m => m.DisassetsComponent),
        data: {
          title: 'AssetDetails'
        }
      },
      {
        path: 'transferassets',
        loadComponent: () => import('./transferassets/transferassets.component').then(m => m.TransferassetsComponent),
        data: {
          title: 'AssetDetails'
        }
      },  
    ]
  }
];
