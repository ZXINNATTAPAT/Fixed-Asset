
export class AssetInventorySessionHelper {
  userinfo: any = [];
  token: any;

  // 🔹 ฟังก์ชันแปลงวันที่เป็นรูปแบบ "dd MMM yyyy"
  convertDate(DateString: string): string {
    if (!DateString) return '-';
    const date = new Date(DateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // 🔹 ฟังก์ชันแปลงชื่อคอลัมน์ให้เป็นภาษาไทย
  translateToThai(column: string): string {
    const translationMap: { [key: string]: string } = {
      SessionId: 'รหัสรอบการตรวจนับ',
      Date: 'วันที่ตรวจนับ',
      SessionName: 'ชื่อรอบตรวจนับ',
      DepartmentId: 'สำนัก',
      FactionId: 'ฝ่าย',
      Note: 'หมายเหตุ',
    };
    return translationMap[column] || column;
  }

  // 🔹 รายชื่อคอลัมน์ที่แสดงในตาราง
  displayedColumns: string[] = [
    // 'sessionId',
    'SessionName',
    'Date',
    'DepartmentId',
    'FactionId',
    'Note',
  ];

  // 🔹 ไว้จัด Header row & col
  displayedColumns3: string[] = [
    'Actions',
    'SessionName',
    'Date',
    'DepartmentId',
    'FactionId',
    'Note',
  ];

  // 🔹 ใช้เรียงข้อมูลในตาราง
  displayedColumns2: string[] = [
    'Actions',
    'SessionName',
    'Date',
    'DepartmentId',
    'FactionId',
    'Note',
  ];
}
