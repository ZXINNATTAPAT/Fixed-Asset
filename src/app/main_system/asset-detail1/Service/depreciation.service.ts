import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DepreciationService {

  constructor() { }

  /**
   * คำนวณปีงบประมาณจากวันที่
   * @param date วันที่รับมาจาก asset
   * @returns string ปีงบประมาณ
   */
  private getFiscalYear(date: string): string {
    const inputDate = new Date(date);
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();

    // หากเป็นเดือน ต.ค. (9) หรือถัดไป ให้เป็นปีงบประมาณถัดไป
    if (month >= 9) {
      return `${year + 1}`;
    } else {
      return `${year}`;
    }
  }

  /**
   * คำนวณตารางค่าเสื่อมราคากรณีปีแรกได้สินทรัพย์มาไม่ครบปี
   * @param purchasePrice มูลค่าซื้อสินทรัพย์
   * @param depreciationRate อัตราค่าเสื่อมราคา (ร้อยละ)
   * @param receiptDate วันที่รับสินค้า
   * @returns Array ของ Object ที่บอกปี, มูลค่าคงเหลือ, ค่าเสื่อมปีนั้น ๆ และค่าเสื่อมสะสม
   */
  calculateDepreciationWithPartialYear(
    purchasePrice: number,
    depreciationRate: number,
    receiptDate: string
  ): { year: string; bookValue: number; depreciation: number; accumulatedDepreciation: number }[] {
    const results: { 
      year: string; 
      bookValue: number; 
      depreciation: number; 
      accumulatedDepreciation: number 
    }[] = [];
    
    let bookValue = purchasePrice;
    let accumulatedDepreciation = 0;

    const annualDepreciation = purchasePrice * (depreciationRate / 100);
    const receipt = new Date(receiptDate);

    // คำนวณค่าเสื่อมราคาปีแรก ( partial year )
    const monthsInYear = 12;
    const monthsToDepreciate = monthsInYear - receipt.getMonth() - 1; 
    const firstYearDepreciation = (annualDepreciation * monthsToDepreciate) / 12;

    // ปีแรก
    const fiscalYearFirst = this.getFiscalYear(receipt.toISOString());
    accumulatedDepreciation += firstYearDepreciation; 
    bookValue -= firstYearDepreciation;

    results.push({
      year: fiscalYearFirst,
      bookValue: parseFloat(bookValue.toFixed(2)),
      depreciation: parseFloat(firstYearDepreciation.toFixed(2)),
      accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
    });

    // ปีถัดไป - เริ่มนับจากวันที่ 1 ต.ค. ของปีถัดจากปีที่ซื้อ
    let currentYear = new Date(receipt.getFullYear() + 1, 9, 1);

    // วนคำนวณค่าเสื่อมราคาประจำปีจนกว่า bookValue จะเหลือ <= 1
    while (bookValue > 1) {
      const annualDep = annualDepreciation;
      accumulatedDepreciation += annualDep;
      bookValue -= annualDep;

      if (bookValue < 1) {
        bookValue = 1;
      }

      const fiscalYear = this.getFiscalYear(currentYear.toISOString());
      results.push({
        year: fiscalYear,
        bookValue: parseFloat(bookValue.toFixed(2)),
        depreciation: parseFloat(annualDep.toFixed(2)),
        accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
      });

      currentYear.setFullYear(currentYear.getFullYear() + 1);
    }

    return results;
  }
}
