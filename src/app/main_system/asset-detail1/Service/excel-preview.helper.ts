import * as XLSX from 'xlsx';

export interface ExcelPreviewResult {
  data: any[];
  validationFlags: {
    departmentError: boolean;
    factionError: boolean;
  }[];
}

export class ExcelPreviewHelper {

  static convertToDate(value: any): Date | null {
    if (value == null || value === '') return null;

    if (!isNaN(value)) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      date.setHours(8);
      return date;
    }

    if (typeof value === 'string' && value.includes('/')) {
      const [day, month, year] = value.split('/');
      let y = parseInt(year);
      if (y > 2400) y -= 543;
      return new Date(y, parseInt(month) - 1, parseInt(day));
    }

    if (typeof value === 'string') {
      value = this.normalizeThaiDate(value);
      const thaiMonths: { [key: string]: number } = {
        'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3,
        'พ.ค.': 4, 'มิ.ย.': 5, 'ก.ค.': 6, 'ส.ค.': 7,
        'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11,
      };
      const match = value.match(/^(\d{1,2})\s+((?:[ก-๙]\.?)+)\s+(\d{4})$/);
      if (match) {
        const day = parseInt(match[1]);
        const monthStr = match[2];
        const monthKey = monthStr.endsWith('.') ? monthStr : monthStr + '.';
        const year = parseInt(match[3]);
        const month = thaiMonths[monthKey] ?? thaiMonths[monthStr];
        const y = year > 2400 ? year - 543 : year;
        if (!isNaN(day) && month !== undefined && !isNaN(y)) {
          return new Date(y, month, day);
        }
      }
    }

    return null;
  }

  static normalizeThaiDate(value: string): string {
    return value
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/([ก-๙]+)(\.?)/g, '$1.')
      .trim();
  }

  static parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
        resolve(rawRows.map((row) => ({ ...row })));
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  // ✅ ตรวจสอบ สำนัก และ ฝ่าย ว่าถูกต้องมั้ย พร้อมเพิ่ม CategoryId, TypeId
  static validateDataAgainstMaster(
    excelData: any[],
    departments: any[],
    categories: any[] = [],
    createdByUserId?: number
  ): ExcelPreviewResult {
    const validatedData = excelData.map((row) => {
      const deptName = row['สำนัก']?.trim();
      const factionName = row['ฝ่าย']?.trim();
      const assetCode = row['รหัสครุภัณฑ์']?.trim() || '';

      // ✅ ตรวจสอบและหา Department
      const dept = departments.find((d) => d.Name?.trim() === deptName);
      const departmentId = dept?.DeptId ?? null;
      row.DepartmentId = departmentId;

      // ✅ ตรวจสอบและหา Faction ภายใน Department
      let factionId = null;
      let factionValid = false;

      if (dept?.Factions?.length) {
        const faction = dept.Factions.find((f: { Name: string }) => f.Name?.trim() === factionName);
        if (faction) {
          factionId = faction.FactId;
          factionValid = true;
        }
      }
      row.FactionId = factionId;

      // ✅ ดึง Category จาก AssetCode เช่น "กกต 0401-001-2567" → "0401"
      const categoryCodeMatch = assetCode.match(/กกต\s(\d{4})-/);
      if (categoryCodeMatch) {
        const categoryCode = categoryCodeMatch[1].toString();

        const category = categories.find((c: any) => c.CategoryCode === categoryCode);
        if (category) {
          row.CategoryId = category.CategoryId;
          row.TypeId = category.TypeId;
        } else {
          console.warn('⚠️ ไม่พบ CategoryCode:', categoryCode);
        }
      }

      // console.log(createdByUserId);

      // ✅ ใส่ CreatedBy (userId) ถ้ามี
      if (createdByUserId) {
        row.CreatedBy = createdByUserId;
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


  // ✅ แปลงข้อมูลที่พร้อมจะส่ง backend
  static translateToEnglish(row: any): any {
    return {

      // ✅ ส่งเข้า backend
      AssetCode: row['รหัสครุภัณฑ์'],
      AssetName: row['รายการ'],
      PurchasePrice: Number((row['ราคาต่อหน่วย'] || '0').toString().replace(/,/g, '')),
      DeptId: row.DepartmentId || null,
      FactionId: row.FactionId || null,
      StatusId: 4,
      Note: row['หมายเหตุ'] ?? '',
      ResponsibleEmployee: row['ผู้ใช้งาน'] || '',
      PurchaseDate: this.convertToDate(row['วันเดือนปี'])?.toISOString(),
      Unit: row['หน่วยนับ'] || '',
      CategoryId: row.CategoryId || null,
      TypeId: row.TypeId || null,
      CreatedBy: row.CreatedBy || null,
      
  
      // 🟡 ไม่ส่งเข้า backend แต่เก็บไว้ใช้แสดงผลใน frontend
      User: row['ผู้ใช้งาน'] || '',
      Department: row['สำนัก'],
      Faction: row['ฝ่าย'],
      rawPurchaseDate: row['วันเดือนปี'],
      rawStatus: row['สถานะ'],
      rawPurchasePrice: row['ราคาต่อหน่วย'],
    };
  }
  
}
