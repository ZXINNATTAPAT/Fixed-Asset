import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'inventorysession', // เปลี่ยนเป็นตัวพิมพ์เล็กทั้งหมด
        loadComponent: () => import('./assetcount/asset-inventory-session/asset-inventory-session.component')
        .then(m => m.AssetInventorySessionComponent),
        data: { title: 'inventorysession' }
    },
    {
        path: 'inventorycycle', // เปลี่ยนเป็นตัวพิมพ์เล็กทั้งหมด
        loadComponent: () => import('./assetcount/asset-inventory-cycle/asset-inventory-cycle.component')
        .then(m => m.AssetInventoryCycleComponent),
        data: { title: 'inventorycycle' }
    },
    {
        path: 'receive', // เปลี่ยนเป็นตัวพิมพ์เล็กทั้งหมด
        loadComponent: () => import('./receive/receive.component')
        .then(m => m.ReceiveComponent),
        data: { title: 'receive' }
    },
    {
        path: 'depreciation-table', // เปลี่ยนเป็นตัวพิมพ์เล็กทั้งหมด
        loadComponent: () => import('./depreciation-table/depreciation-table.component')
        .then(m => m.DepreciationTableComponent),
        data: { title: 'depreciation-table' }
    },
  {
    path: '',
    data: {title: ''},
    children: [
      {
        path: 'assetcount',
        loadComponent: () => import('./assetcount/assetcount.component')
        .then(m => m.AssetcountComponent),
        data: {title: 'Assetcount'}
      },
      {
        path: 'repair',
        loadComponent: () => import('./repair/repair.component')
        .then(m => m.RepairComponent),
        data: {title: 'AssetDetails'}
      },
      {
        path: 'sellassets',
        loadComponent: () => import('./sellassets/sellassets.component')
        .then(m => m.SellassetsComponent),
        data: {title: 'AssetDetails'}
      },
      {
        path: 'disassets',
        data: { title: 'Disposal Menu' },
        children: [
          {
            path: '',
            loadComponent: () => import('./disassets/disassets.component')
              .then(m => m.DisassetsComponent),
            data: { title: 'Disposal Menu' }
          },
          {
            path: 'sale',
            loadComponent: () => import('./disassets/Sale/disasset-sale.component')
              .then(m => m.DisassetSaleComponent),
            data: { title: 'ขายครุภัณฑ์' }
          },
          {
            path: 'donation',
            loadComponent: () => import('./disassets/donation/disasset-donation.component')
              .then(m => m.DisassetDonationComponent),
            data: { title: 'บริจาคครุภัณฑ์' }
          },
          {
            path: 'decommission',
            loadComponent: () => import('./disassets/decommission/disasset-decommission.component.')
              .then(m => m.DisassetDecommissionComponent),
            data: { title: 'เลิกใช้ครุภัณฑ์' }
          }
        ]
      },
      {
        path: 'transferassets',
        loadComponent: () => import('./transferassets/transferassets.component')
        .then(m => m.TransferassetsComponent),
        data: {title: 'AssetDetails'}
      },  
      
      {
        path: 'recordAssetcount',
        loadComponent: () => import('./recordascount/recordascount.component')
       .then(m => m.RecordascountComponent),
        data: {
          title: 'Assetcount'
        }
      },
     
    ]
  }
];
