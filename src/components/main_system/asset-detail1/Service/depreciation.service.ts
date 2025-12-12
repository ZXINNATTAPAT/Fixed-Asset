import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DepreciationService {

  constructor() {}

  /**
   * คำนวณปีงบประมาณจากวันที่
   * @param date วันที่รับมาจาก asset
   * @returns string ปีงบประมาณ
   */
  private getFiscalYear(date: string): string {
    const inputDate = new Date(date);
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    return (month >= 9) ? `${year + 1}` : `${year}`;
  }

  /**
   * คำนวณตารางค่าเสื่อมราคาถึงปีงบประมาณปัจจุบันเท่านั้น
   */
  calculateDepreciationWithPartialYear(
    purchasePrice: number,
    depreciationRate: number,
    receiptDate: string,
    servicelife: number
  ): {
    year: string;
    bookValue: number;
    depreciation: number;
    accumulatedDepreciation: number;
  }[] {
    const results: {
      year: string;
      bookValue: number;
      depreciation: number;
      accumulatedDepreciation: number;
    }[] = [];
    let bookValue = purchasePrice;
    let accumulatedDepreciation = 0;
    const annualDepreciation = purchasePrice * (depreciationRate / 100);
    const receipt = new Date(receiptDate);

    const fiscalYearFirst = this.getFiscalYear(receipt.toISOString());
    const currentFiscalYear = this.getFiscalYear(new Date().toISOString());

    // ✅ คิดค่าเสื่อมปีแรกแบบ partial ตามเดือนที่รับ
    const monthsToDepreciate = 12 - receipt.getMonth();
    const firstYearDepreciation = (annualDepreciation * monthsToDepreciate) / 12;

    accumulatedDepreciation += firstYearDepreciation;
    bookValue -= firstYearDepreciation;

    results.push({
      year: fiscalYearFirst,
      bookValue: parseFloat(bookValue.toFixed(2)),
      depreciation: parseFloat(firstYearDepreciation.toFixed(2)),
      accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
    });

    // ✅ คำนวณปีถัดไปต่อเมื่อยังไม่เกินปีงบปัจจุบัน
    let fiscalYear = parseInt(fiscalYearFirst);
    for (let i = 1; i < servicelife; i++) {
      fiscalYear++;
      if (fiscalYear > parseInt(currentFiscalYear)) break;

      accumulatedDepreciation += annualDepreciation;
      bookValue -= annualDepreciation;
      if (bookValue < 1) bookValue = 1;

      results.push({
        year: fiscalYear.toString(),
        bookValue: parseFloat(bookValue.toFixed(2)),
        depreciation: parseFloat(annualDepreciation.toFixed(2)),
        accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
      });
    }

    return results;
  }
}
