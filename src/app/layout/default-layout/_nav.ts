import { INavData } from '@coreui/angular';

// ✅ ขยาย INavData เพื่อรองรับ roles[]
export interface ICustomNavData extends INavData {
  roles?: string[]; // ✅ เพิ่ม roles
}

export const navItems: ICustomNavData[] = [
  {
    name: 'แดชบอร์ด',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    roles: ['Admin', 'เจ้าหน้าที่ฝ่ายพัสดุ', 'เจ้าหน้าที่ทั่วไป', 'เจ้าหน้าที่ฝ่ายอำนวยการ'],
    children: [
      {
        name: 'แดชบอร์ดสรุปภาพรวม (ส่วนกลาง)',
        url: '/dashboard/ส่วนกลาง/',
        icon: 'nav-icon-bullet',
        // roles: ['Admin', 'เจ้าหน้าที่ฝ่ายอำนวยการ']
      },
      // {
      //   name: 'แดชบอร์ดสรุปภาพรวม (ส่วนภูมิภาค)',
      //   url: '/dashboard/ส่วนภูมิภาค/',
      //   icon: 'nav-icon-bullet',
      //   // roles: ['Admin', 'เจ้าหน้าที่ฝ่ายภูมิภาค']
      // }
    ]
  },
  // {
  //   name: 'รายการที่ต้องรับมอบ',
  //   url: '/table/receive',
  //   iconComponent: { name: 'cil-pencil' },
  //   roles: ['Admin'] // ✅ เฉพาะผู้ดูแลระบบ
  // },
  {
    name: 'บันทึกรายการรายวัน',
    url: '/system',
    iconComponent: { name: 'cil-pencil' },
    roles: ['Admin', 'เจ้าหน้าที่ฝ่ายพัสดุ'],
    children: [
      { name: 'เพิ่มรายการครุภัณฑ์', url: '/system/main/assetDetails', icon: 'nav-icon-bullet' },
      { name: 'ตรวจนับครุภัณฑ์', url: '/system/sub/assetcount', icon: 'nav-icon-bullet' },
      { name: 'บันทึกซ่อมแซม', url: '/system/sub/repair', icon: 'nav-icon-bullet' },
      { name: 'โอนย้ายครุภัณฑ์', url: '/system/sub/transferassets', icon: 'nav-icon-bullet' },
      { name: 'ตัดจำหน่ายครุภัณฑ์', url: '/system/sub/disassets', icon: 'nav-icon-bullet' }
    ]
  },
  {
    name: 'รายการบันทึก',
    url: '/table',
    iconComponent: { name: 'cil-pencil' },
    roles: ['Admin', 'เจ้าหน้าที่ฝ่ายพัสดุ', 'เจ้าหน้าที่ฝ่ายอำนวยการ'],
    children: [
      { name: 'รายการที่ต้องรับมอบ', url: '/table/receive', icon: 'nav-icon-bullet' },
      { name: 'รายการครุภัณฑ์', url: '/table/assettable', icon: 'nav-icon-bullet' },
      { name: 'ค่าเสื่อมครุภัณฑ์', url: '/table/depreciation-table', icon: 'nav-icon-bullet' },
      { name: 'รายการการตรวจนับ', url: '/table/inventorysession', icon: 'nav-icon-bullet' }
    ]
  },
  {
    name: 'ทะเบียนผู้ใช้งาน',
    url: '/usersmanagement',
    iconComponent: { name: 'cil-pencil' },
    roles: ['Admin','เจ้าหน้าที่ฝ่ายพัสดุ'] // ✅ เฉพาะผู้ดูแลระบบ
  },
  
  {
    name: 'กำหนดข้อมูลตั้งต้น',
    url: '/defaultdata',
    iconComponent: { name: 'cil-pencil' },
    roles: ['Admin', 'เจ้าหน้าที่จัดการข้อมูล'],
    children: [
      { name: 'รหัสประเภทสินทรัพย์', url: '/defaultdata/Assettypecode', icon: 'nav-icon-bullet' },
      { name: 'หมวดสินทรัพย์', url: '/defaultdata/asc', icon: 'nav-icon-bullet' },
      { name: 'รหัสสำนักงาน', url: '/defaultdata/sectiontype', icon: 'nav-icon-bullet' },
      { name: 'รหัสฝ่าย', url: '/defaultdata/faction', icon: 'nav-icon-bullet' },
      // { name: 'หน่วยนับ', url: '/defaultdata/coutingunit', icon: 'nav-icon-bullet' },
      { name: 'ผู้ขายทรัพย์สิน', url: '/defaultdata/ps', icon: 'nav-icon-bullet' }
    ]
  }
];
export { INavData };
