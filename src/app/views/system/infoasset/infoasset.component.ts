import { Component } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { ApiService } from 'src/app/api-service.service';

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
  [key: string]: string | number ; // ลักษณะดัชนีสำหรับการเข้าถึงด้วยชื่อคอลัมน์อื่นๆ
}

@Component({
  selector: 'app-infoasset',
  standalone: true,
  imports: [TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent ],
  templateUrl: './infoasset.component.html',
  styleUrl: './infoasset.component.scss'
})
export class InfoassetComponent {

  constructor(private apiService: ApiService) {
    this.getAssetDetails();
  }

  assetDetails: AssetDetails[] = [];


  getAssetDetails(): void {
    this.apiService.fetchData('assetDetails').subscribe(data => {
      this.assetDetails = data.map((asset: { purchaseDate: string; }) => {
        asset.purchaseDate = this.convertDate(asset.purchaseDate);
        asset = this.translateToThai(asset);
        return asset;
      });
      // Update the data source with the new asset details
      // this.dataSource.data = this.assetDetails;
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

