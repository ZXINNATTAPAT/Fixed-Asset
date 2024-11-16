// import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { MAT_DATE_FORMATS } from '@angular/material/core';
// import { Injectable } from '@angular/core';
// import * as moment from 'moment';

// @Injectable()
// export const THAI_DATE_FORMATS = {
//   parse: {
//     dateInput: 'LL',
//   },
//   display: {
//     dateInput: 'LL',
//     monthYearLabel: 'MMM YYYY',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'MMMM YYYY',
//   },
// };

// export const BUDDHIST_DATE_FORMATS = {
//   ...THAI_DATE_FORMATS,
//   parse: {
//     ...THAI_DATE_FORMATS.parse,
//     dateInput: 'LL', // Adjust as needed
//   },
//   display: {
//     ...THAI_DATE_FORMATS.display,
//     dateInput: 'LL', // Adjust as needed
//     yearLabel: 'YYYY', // Show year in Buddhist Era
//   },
// };

// export class BuddhistDateAdapter extends MomentDateAdapter {

//   override format(date: moment.Moment, displayFormat: string): string {
//     if (displayFormat === 'YYYY') {
//       const buddhistYear = date.year() + 543;
//       return `${buddhistYear}`;
//     }
//     return super.format(date, displayFormat);
//   }
// }
