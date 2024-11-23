// asset.service.ts
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  constructor() {}
  

  // Example of a reusable alert function
  showAlert(): void {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาเลือกประเภทก่อน',
      text: 'คุณต้องเลือกประเภทครุภัณฑ์ก่อนที่จะเลือกหมวดหมู่',
    });
  }

  translateToEnglish(asset: any): any {
    const translationMap: { [key: string]: string } = {
      
      วันเดือนปี: 'purchaseDate',
      
      วันเดือนปีที่รับ: 'ReceiptDate',

      รหัสครุภัณฑ์: 'assetCode',
      
      รายการ: 'assetName',
      
      ประเภทครุภัณฑ์:'assetType',
      
      หมวดหมู่ครุภัณฑ์:'assetCategory',
      
      ราคาต่อหน่วย: 'purchasePrice',
      
      วิธีการได้มา: 'purchasedFrom',
      
      เลขที่เอกสาร: 'documentNumber',
      
      ฝ่าย: 'department',
      
      หน่วยงาน: 'agency',
      
      ผู้ใช้งาน: 'responsibleEmployee',
      
      หมายเหตุ: 'note',
    };

    const translatedAsset: any = {};
    for (const [key, value] of Object.entries(asset)) {
      const translatedKey = translationMap[key] || key;
      translatedAsset[translatedKey] = value;
    }

    return translatedAsset;
  }
}
