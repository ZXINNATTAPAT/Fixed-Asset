import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DepreciationScheduleService {
  
  calculateSchedule(purchasePrice: number, rate: number, receiptDate: string) {
    const schedule: { year: string; depreciation: number; accumulatedDepreciation: number; bookValue: number }[] = [];
    const rateDecimal = rate / 100;
    const startYear = new Date(receiptDate).getFullYear();

    let bookValue = purchasePrice;
    let accumulatedDepreciation = 0;

    for (let year = 0; year < 5; year++) {
      const depreciation = bookValue * rateDecimal;
      accumulatedDepreciation += depreciation;
      bookValue -= depreciation;

      schedule.push({
        year: `${startYear + year}`,
        depreciation: parseFloat(depreciation.toFixed(2)),
        accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
        bookValue: parseFloat(bookValue.toFixed(2))
      });
    }

    return schedule;
  }

  extractFirstYearSummary(schedule: any[]) {
    if (!schedule.length) return { depreciation: 0, accumulatedDepreciation: 0, bookValue: 0 };
    const first = schedule[0];
    return {
      depreciation: first.depreciation,
      accumulatedDepreciation: first.accumulatedDepreciation,
      bookValue: first.bookValue
    };
  }
}
