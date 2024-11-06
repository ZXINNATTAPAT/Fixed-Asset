import { Router } from '@angular/router';
import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash } from '@coreui/icons';
import { jwtDecode } from 'jwt-decode';


export class myFunction {
  // แก้ไขให้เป็นการประกาศแบบไม่ระบุค่าเริ่มต้น
  userinfo: any = [];
  token: any;
  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

  constructor(private router: Router) {}

  readinfo() {
    this.token = localStorage.getItem('token');
    const decodedToken = jwtDecode(this.token);
    this.userinfo = decodedToken;
    return this.userinfo;
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }

  addasset(): void {
    this.router.navigate(['/system/AssetDetails']);
  }

  infoasset(asset: any): void {
    this.router.navigate([`/system/infoasset/${asset.assetId}`]);
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      purchaseDate: 'วันเดือนปี',
      assetCode: 'รหัสครุภัณฑ์',
      assetName: 'รายการ',
      purchasePrice: 'ราคาต่อหน่วย',
      purchasedFrom: 'วิธีการได้มา',
      documentNumber: 'เลขที่เอกสาร',
      assetLocation: 'ที่อยู่',
      agency: 'หน่วยงาน',
      department: 'ฝ่าย',
      responsibleEmployee: 'ผู้ใช้งาน',
      status: 'สถานะ',
      note: 'หมายเหตุ',
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  formatCurrency(price: number): string {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
  
  displayedColumns: string[] = [
    'purchaseDate',
    'assetCode',
    'assetName',
    'purchasePrice',
    'purchasedFrom',
    'documentNumber',
    'agency',
    'department',
    'assetLocation',
    'responsibleEmployee',
    'note',
  ];

  //ไว้จัด Header row & col
  displayedColumns3: string[] = [
    'Aactions',
    'Qrcode',
    'สถานะ',
    'วันเดือนปี',
    'รหัสครุภัณฑ์',
    'รายการ',
    'ราคาต่อหน่วย',
    'วิธีการได้มา',
    // 'เลขที่เอกสาร',
    // 'หน่วยงาน',
    'ฝ่าย',
    'ที่อยู่',
    'ผู้ใช้งาน',
    // 'หมายเหตุ',
    // 'addcol'
  ];

  //ทั้งหมด
  displayedColumns1: string[] = [
    'Aactions',
    'Qrcode',
    'สถานะ',
    'วันเดือนปี',
    'รหัสครุภัณฑ์',
    'รายการ',
    'ราคาต่อหน่วย',
    'วิธีการได้มา',
    'เลขที่เอกสาร',
    'หน่วยงาน',
    'ฝ่าย',
    'ที่อยู่',
    'ผู้ใช้งาน',
    'หมายเหตุ',
    // 'addcol'
  ];

  //ไว้เรียงข้อมูลในตาราง
  displayedColumns2: string[] = [
    'สถานะ',
    'วันเดือนปี',
    'รหัสครุภัณฑ์',
    'รายการ',
    'ราคาต่อหน่วย',
    'วิธีการได้มา',
    'เลขที่เอกสาร',
    'หน่วยงาน',
    'ฝ่าย',
    'ที่อยู่',
    'ผู้ใช้งาน',
    'หมายเหตุ',
  ];
}
