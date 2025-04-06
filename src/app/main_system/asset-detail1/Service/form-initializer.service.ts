import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormInitializerService {

  constructor(private fb: FormBuilder) {}

  createAssetForm(userId: number): FormGroup {
    return this.fb.group({
      AssetId: [0, Validators.required],
      AssetCode: [''],
      AssetName: ['', Validators.required],
      Quantity: [1, [Validators.required, Validators.min(1)]],
      Unit: ['', Validators.required],
      PropertySeller: ['', Validators.required],
      TypeId: [0, Validators.required],
      CategoryId: [0, Validators.required],
      DepartmentId: [0, Validators.required],
      FactionId: [0, Validators.required],
      ResponsibleEmployee: ['', Validators.required],
      TaxInvoiceNumber: [''],
      PurchaseDate: ['', Validators.required],
      ReceiptDate: ['', Validators.required],
      DepreciationStartDate: ['', Validators.required],
      DepreciationCalculationStartDate: ['', Validators.required],
      PurchasePrice: [0, [Validators.required]],
      CalculatedPrice: [0, [Validators.required, Validators.min(0)]],
      ScrapPrice: [0, [Validators.required, Validators.min(0)]],
      DepreciationRate: [0, [Validators.required, Validators.min(0)]],
      AssetAge: [0, [Validators.required, Validators.min(0)]],
      DepreciationEndDate: [''],
      AccumulatedDepreciation: [0, [Validators.required, Validators.min(0)]],
      DepreciationValue: [0, [Validators.required, Validators.min(0)]],
      BookValue: [0, [Validators.required, Validators.min(0)]],
      Note: [''],
      StatusId: [4],
      CreatedBy: [userId],
      SubAssets: this.fb.array([]),
      numberOfCopies: [1]
    });
  }

  // Optional: helper สำหรับ sub-asset ด้วย
  createSubAssetForm(data: any, parentAssetCode: string, responsible: string): FormGroup {
    return this.fb.group({
      subAssetId: [data?.SubAssetId || 0],
      assetId: [data?.AssetId || 0],
      subAssetCode: [`${parentAssetCode}`],
      subAssetName: [data?.SubAssetName || ''],
      unit: [data?.Unit || '', Validators.required],
      assetLocation: [data?.AssetLocation || ''],
      ResponsibleEmployee: [responsible, Validators.required],
      status: [data?.Status || ''],
      note: [data?.Note || ''],
      assetDetails: [],
    });
  }
}
