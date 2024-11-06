import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [

  {
    name: 'แดชบอร์ด',
    url: '/system',
    iconComponent: { name: 'cil-speedometer' },
    children: [
      {
        name: 'แดชบอร์ดกลาง',
        url: '/mainpage',
        icon:'nav-icon-bullet' ,
      },
      {
        name: 'แดชบอร์ดสรุปภาพรวม',
        url: '/dashboard',
        icon:'nav-icon-bullet' ,
      },
    ]
  },
  {
    name: 'บันทึกรายการรายวัน',
    url: '/system',
    iconComponent: { name: 'cil-pencil' },
    children: [
      {
        name: 'เพิ่มครุภัณฑ์',
        url: '/system/AssetDetails',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'รายการตรวจนับครุภัณท์',
        url: '/system/Assetcount',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'บันทึกซ่อมแซม',
        url: '/system/Repair',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'จำหน่ายครุภัณฑ์',
        url: '/system/sellassets',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'โอนย้ายครุภัณฑ์',
        url: '/system/transferassets',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'เลิกใช้ครุภัณฑ์',
        url: '/system/disassets',
        icon: 'nav-icon-bullet'
      },
    ]
  },
  {
    name: 'รายการครุภัณฑ์',
    url: '/assettable',
    // icon: 'nav-cil-folder',
    iconComponent: { name: 'cil-pencil' }
  
  },
  {
    name: 'บันทึกการตรวจนับ',
    url: 'system/recordAssetcount',
    // icon: 'nav-cil-folder',
    iconComponent: { name: 'cil-pencil' }
  
  },
  // {
  //   title: true,
  //   name: 'แก้ไขข้อมูลในระบบ'
  // },
  {
    name: 'เพิ่มข้อมูลตั้งต้น',
    url: '/defaultdata',
    iconComponent: { name: 'cil-pencil' },
    children: [
      {
        name: 'กำหนดรหัสประเภทครุภัณฑ์',
        url: '/defaultdata/Assettypecode',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'กำหนดหมวดครุภัณฑ์ ',
        url: '/defaultdata/asc',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'กำหนดรหัสส่วนงาน',
        url: '/defaultdata/sectiontype',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'กำหนดรหัสฝ่าย',
        url: '/defaultdata/faction',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'กำหนดหน่วยนับ',
        url: '/defaultdata/coutingunit',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'กำหนดผู้ขายทรัพย์สิน',
        url: '/defaultdata/ps',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'กำหนดผู้รับผิดชอบ',
        url: '/defaultdata/rp',
        icon: 'nav-icon-bullet'
      },
      
      {
        name: 'กำหนดผังบัญชี ',
        url: '/defaultdata/acc',
        icon: 'nav-icon-bullet'
      },
    ]
  },
]