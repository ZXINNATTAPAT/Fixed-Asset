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
      
      วันเดือนปีที่รับ: 'receiptDate',

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

  convertToDate(dateString: string): Date {
    const thaiMonths = [
      'ม.ค.','ก.พ.','มี.ค.',
      'เม.ย.','พ.ค.','มิ.ย.',
      'ก.ค.','ส.ค.','ก.ย.',
      'ต.ค.','พ.ย.','ธ.ค.',
    ];
    const parts = dateString.split(' ');

    if (parts.length !== 3) {
      throw new Error('Invalid date format');
    }

    const day = parseInt(parts[0], 10);
    const month = thaiMonths.indexOf(parts[1]);
    let year = parseInt(parts[2], 10);

    if (isNaN(day) || month === -1 || isNaN(year)) {
      throw new Error('Invalid date components');
    }

    if (this.isThaiYear(year)) {
      year = this.convertThaiToGregorian(year);
    }

    return new Date(year, month, day);
  }

  isThaiYear(year: number): boolean { return year > 2400; }
  convertThaiToGregorian(year: number): number {return year - 543; }// Convert Buddhist year to Gregorian year


}
