import { Component } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
// import { ApiService } from 'src/app/api-service.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';

interface AssetDetails {
  assetId: any;
  purchaseDate: string;
  assetCode: string;
  assetName: string;
  purchasePrice: number;
  purchasedFrom: string;
  documentNumber: string;
  department: string;
  responsibleEmployee: string;
  Note: string;
  [key: string]: string | number ; 
  // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
}

@Component({
  selector: 'app-infoasset',
  standalone: true,
  imports: [TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent ],
  templateUrl: './infoasset.component.html',
  styleUrl: './infoasset.component.scss'
})

export class InfoassetComponent {

  assetDetails: AssetDetails[] = [];

  assets:any = {};

  qrCodeUrl: string ='';

  constructor(private http: HttpClient , private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const assetId = params['assetId'];
      if (assetId) {
        // เรียกข้อมูล AssetDetails จาก API
        this.http.get<any>('https://localhost:7204/api/AssetDetails/' + assetId)
          .subscribe((data: any) => {
            this.assets = data ;
            console.log(this.assets);
            // สร้าง QR code จาก path ที่เป็น URL ของ asset details
            const path = 'http://localhost:4200/#/system/infoasset/' + assetId;
            QRCode.toDataURL(path, (err, url) => {
              if (err) throw err;
              // นำ URL ของ QR code ไปใช้งานต่อ
              console.log('QR code URL:', url);
              this.qrCodeUrl= url;
              // ในที่นี้คุณสามารถส่ง URL ไปยัง HTML template เพื่อแสดงผลได้
            });
          });
      }
    });
  }

  translateToThai(asset: any): any {
    const translationMap: { [key: string]: string } = {
      "purchaseDate": "วันเดือนปี",
      "assetCode": "รหัสครุภัณฑ์",
      "assetName": "รายการ",
      "purchasePrice": "ราคาต่อหน่วย",
      "purchasedFrom": "วิธีการได้มา",
      "documentNumber": "เลขที่เอกสาร",
      "department": "แผนก",
      "responsibleEmployee": "ผู้ใช้งาน",
      "note": "หมายเหตุ"
    };

    const translatedAsset: { [key: string]: any } = {};
    for (const key in asset) {
      if (asset.hasOwnProperty(key)) {
        translatedAsset[translationMap[key] || key] = asset[key];
      }
    }
    return translatedAsset;
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }

}

