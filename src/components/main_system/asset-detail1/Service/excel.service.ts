import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  // ฟังก์ชันสำหรับแปลงวันที่
  convertToDate(excelDate: any): string {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0]; // แปลงเป็น YYYY-MM-DD
  }

  // ฟังก์ชันสำหรับแปลข้อมูลเป็นภาษาอังกฤษ
  translateToEnglish(data: any): any {
    // ตัวอย่างการแปลง
    const translatedData: any = { ...data };
    translatedData['assetCode'] = data['รหัสครุภัณฑ์'];
    translatedData['assetCategory'] = data['หมวดหมู่ครุภัณฑ์'];
    translatedData['assetType'] = data['ประเภทครุภัณฑ์'];
    return translatedData;
  }

  // ฟังก์ชันสำหรับ Import Excel
  importExcel(file: File, assetCategory: any[], assetTypes: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data: string = e.target.result;
          const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
          const worksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
          const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const jsonArray: any[] = [];

          for (let i = 1; i < excelData.length; i++) {
            const rowData = excelData[i];
            const jsonObject: any = {};

            for (let j = 0; j < rowData.length; j++) {
              const columnName = excelData[0][j];
              let cellValue = rowData[j];

              if (columnName.includes('ลำดับ') && !isNaN(cellValue)) {
                continue;
              }

              if (
                columnName.includes('วันเดือนปี') ||
                columnName.includes('วัน') ||
                columnName.includes('ว.ด.ป.ที่ซื้อ')
              ) {
                if (cellValue) {
                  cellValue = this.convertToDate(cellValue);
                }
              }

              jsonObject[columnName] = cellValue;
            }

            const assetCode = jsonObject['รหัสครุภัณฑ์'];

            if (assetCode && assetCode.startsWith('กกต')) {
              const assetCategoryCode = assetCode.split(' ')[1]?.split('-')[0];

              if (assetCategoryCode) {
                const category = assetCategory.find(
                  (cat) => cat.asc_Code === assetCategoryCode
                );

                if (category) {
                  jsonObject['หมวดหมู่ครุภัณฑ์'] = category.asc_Code;

                  const assetType = assetTypes.find(
                    (type) => type.assetCode === category.assetCode
                  );

                  if (assetType) {
                    jsonObject['ประเภทครุภัณฑ์'] = assetType.assetCode;
                  } else {
                    console.error(
                      `Asset type not found for code: ${category.assetCode}`
                    );
                    continue;
                  }
                } else {
                  console.error(`Category not found for code: ${assetCategoryCode}`);
                  continue;
                }
              } else {
                console.error(`Invalid asset code format: ${assetCode}`);
                continue;
              }
            }

            const translatedData = this.translateToEnglish(jsonObject);
            jsonArray.push(translatedData);
          }

          resolve(jsonArray);
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsBinaryString(file);
    });
  }
}
