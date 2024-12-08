import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: '',
      data: {
        title: ''
      },
      children: [
        {
          path: 'Assettypecode',
          loadComponent: () => import('./assettypecode/defaultdata.component')
          .then(m => m.DefaultdataComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดรหัสประเภทสินทรัพย์'
          }
        },
        {
          path: 'sectiontype',
          loadComponent: () => import('./sectiontype/sectiontype.component')
          
          .then(m => m.SectiontypeComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดรหัสส่วนงาน'
          }
        },
        {
          path: 'faction',
          loadComponent: () => import('./faction-code/faction-code.component')
          .then(m => m.FactionCodeComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดรหัสฝ่าย'
          }
        },
        {
          path: 'coutingunit',
          loadComponent: () => import('./countingunit/countingunit.component')
          .then(m => m.CountingunitComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดหน่วยนับ'
          }
        },
        {
          path: 'ps',
          loadComponent: () => import('./property-seller/property-seller.component')
          .then(m => m.PropertySellerComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดผู้ขายทรัพย์สิน'
          }
        },
        {
          path: 'rp',
          loadComponent: () => import('./responsibleperson/responsibleperson.component')
          .then(m => m.ResponsiblepersonComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดผู้รับผิดชอบ'
          }
        },
        {
          path: 'asc',
          loadComponent: () => import('./assetcategory/assetcategory.component')
          .then(m => m.AssetcategoryComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดหมวดสินทรัพย์'
          }
        },
        {
          path: 'acc',
          loadComponent: () => import('./accounts/accounts.component')
          .then(m => m.AccountsComponent), // เปลี่ยน loadComponent เป็น component
          data: {
            title: 'กำหนดผังบัญชี'
          }
        },
      ]
    }
];
