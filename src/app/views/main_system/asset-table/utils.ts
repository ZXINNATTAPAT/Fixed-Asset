import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash } from '@coreui/icons';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from 'src/app/api-service.service';


export class myFunction {



  userinfo: any = [];

  token: any;

  icons = { cilPencil, cilTrash, cibAddthis, cilDataTransferDown, cilInfo };

 

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
    window.location.href = '#/system/AssetDetails';
  }

  infoasset(asset: any): void {
    window.location.href = `#/system/infoasset/${asset.assetId}`;
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      PurchaseDate: 'วันเดือนปี',
      AssetCode: 'รหัสครุภัณฑ์',
      AssetName: 'รายการ',
      PurchasePrice: 'ราคาต่อหน่วย',
      PurchasedFrom: 'วิธีการได้มา',
      DocumentNumber: 'เลขที่เอกสาร',
      AssetLocation: 'ที่อยู่',
      Department: 'สำนัก',
      Faction: 'ฝ่าย',
      ResponsibleEmployee: 'ผู้ใช้งาน',
      Status: 'สถานะ',
      Note: 'หมายเหตุ',
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
