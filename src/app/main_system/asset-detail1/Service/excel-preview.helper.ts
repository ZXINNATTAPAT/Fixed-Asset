import * as XLSX from 'xlsx';

export interface ExcelPreviewResult {
  data: any[];
  validationFlags: {
    departmentError: boolean;
    factionError: boolean;
  }[];
}

export class ExcelPreviewHelper {
  // ✅ ฟังก์ชันแปลง serial date เป็น ISO (รองรับ พ.ศ.)
  static convertToDate(value: any): string {
    // ถ้าเป็น serial (เลข) เช่น 45000+
    if (!isNaN(value)) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      date.setHours(8); // ปรับ timezone
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // ถ้าเป็น string อยู่แล้ว (format DD/MM/YYYY)
    if (typeof value === 'string' && value.includes('/')) {
      const [day, month, year] = value.split('/');
      let y = parseInt(year);
      if (y > 2400) y -= 543; // ถ้าเป็น พ.ศ. แปลงเป็น ค.ศ.
      const iso = new Date(y, parseInt(month) - 1, parseInt(day));
      return iso.toISOString().split('T')[0];
    }

    return ''; // กรณีแปลงไม่ได้
  }

  static parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

        // ✅ แปลงวันที่ในทุก field ที่ชื่อมี "วัน", "วันที่", "วันเดือนปี"
        const processed = rawRows.map((row) => {
          const newRow = { ...row };
          for (const key in newRow) {
            if (key.includes('วัน')) {
              newRow[key] = this.convertToDate(newRow[key]);
            }
          }
          return newRow;
        });

        resolve(processed);
      };

      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  static validateDataAgainstMaster(
    excelData: any[],
    departments: any[] // ✅ รวม Factions ไว้ภายใน
  ): ExcelPreviewResult {
    const validatedData = excelData.map((row) => {
      const deptName = row['สำนัก']?.trim();
      const factionName = row['ฝ่าย']?.trim();

      const dept = departments.find((d) => d.Name?.trim() === deptName);
      const factionValid = dept?.factions?.some(
        (f: { name: string }) => f.name?.trim() === factionName
      );

      if (dept) row.DepartmentId = dept.departmentId;
      if (factionValid) {
        const faction = dept.factions.find((f: { name: string }) => f.name?.trim() === factionName);
        row.FactionId = faction.factId;
      }

      return {
        ...row,
        departmentError: !dept,
        factionError: !factionValid,
      };
    });

    return {
      data: validatedData,
      validationFlags: validatedData.map((d) => ({
        departmentError: d.departmentError,
        factionError: d.factionError,
      })),
    };
  }

  static translateToEnglish(row: any): any {
    return {
      assetCode: row['รหัสครุภัณฑ์'],
      assetName: row['รายการ'],
      assetPrice: row['ราคาต่อหน่วย'],
      department: row['สำนัก'],
      faction: row['ฝ่าย'],
      status: row['สถานะ'],
      note: row['หมายเหตุ'],
      purchaseDate: row['วันเดือนปี'],
      user: row['ผู้ใช้งาน'],
    };
  }
}
