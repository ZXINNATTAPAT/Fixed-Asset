import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class SubAssetService {
  constructor(private fb: FormBuilder) {}

  createSubAssetForm(data: any, code: string, responsible: string): FormGroup {
    return this.fb.group({
      subAssetId: [data?.SubAssetId || 0],
      assetId: [data?.AssetId || 0],
      subAssetCode: [`${code}` || ''],
      subAssetName: [data?.SubAssetName || ''],
      unit: [data?.Unit || ''],
      assetLocation: [data?.AssetLocation || ''],
      ResponsibleEmployee: [responsible|| ''],
      status: [data?.Status || ''],
      note: [data?.Note || ''],
      assetDetails: [],
      // add more fields if necessary
    });
  }

  addSubAsset(assetForm: FormGroup, newSubAssetData: any, assetCode: string, responsible: string): void {
    const subAssets = assetForm.get('SubAssets') as FormArray;
    const existingCodes = subAssets.controls.map(sub => sub.get('subAssetCode')?.value);

    let nextSequence = 1;
    if (existingCodes.length > 0) {
      const maxSequence = existingCodes
        .map(code => {
          const match = code.match(/\((\d+)\)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);
      nextSequence = maxSequence + 1;
    }

    const newCode = `${assetCode}(${nextSequence})`;
    const newForm = this.createSubAssetForm(newSubAssetData, newCode, responsible);
    subAssets.push(newForm);
  }

  removeSubAsset(assetForm: FormGroup, index: number): void {
    const subAssets = assetForm.get('SubAssets') as FormArray;
    if (subAssets && subAssets.length > index) {
      subAssets.removeAt(index);
    }
  }

  getSubAssets(assetForm: FormGroup): FormArray {
    return assetForm.get('SubAssets') as FormArray;
  }
}
