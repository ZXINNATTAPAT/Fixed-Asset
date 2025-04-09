import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';

@Injectable({
  providedIn: 'root',
})
export class AssetCodeService {

  constructor(private api: ApiService) { }

  generateBaseCode(payload: {
    Affiliation: string;
    AssetCategory: string;
    Year: string;
  }): Observable<string> {
    return this.api.assetService.generateAssetCode(payload).pipe(
      map((response) => {
        if (response?.assetCode) {
          return response.assetCode;
        } else {
          throw new Error('ไม่มีข้อมูล assetCode จาก server');
        }
      })
    );
  }

  async generateUniqueCode(
    baseCode: string,
    year: string,
    existingCodes: string[]
  ): Promise<string> {
    let finalCode = baseCode;
    let suffix = 1;

    while (
      existingCodes.some(
        (code) => code === `${baseCode.split('-')[0]}-${suffix}-${year}`
      )
    ) {
      suffix++;
    }

    if (suffix > 1) {
      finalCode = `${baseCode.split('-')[0]}-${suffix}-${year}`;
    }

    return finalCode;
  }
}

// private handleGeneratedAssetCode(generatedCode: string, year: string): void {
//     const isDuplicate = this.assetDetails.some((asset) => asset.AssetCode === generatedCode);
//     if (isDuplicate) {
//       let suffix = 1;
//       while (
//         this.assetDetails.some((asset) => asset.AssetCode === `${generatedCode.split('-')[0]}-${suffix}-${year}`)
//       ) {
//         suffix++;
//       }
//       generatedCode = `${generatedCode.split('-')[0]}-${suffix}-${year}`;
//     }
//     this.asset.patchValue({ AssetCode: generatedCode });
//   }
