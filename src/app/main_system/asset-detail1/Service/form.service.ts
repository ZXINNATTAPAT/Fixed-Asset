import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../ApiController/apiservice/api-service.service';

@Injectable({ providedIn: 'root' })
export class FormService {
  constructor(private fb: FormBuilder) { }

  createAssetForm(userId: string): FormGroup {
    return this.fb.group({
      AssetCode: ['', Validators.required],
      AssetName: ['', Validators.required],
      PurchasePrice: [0, Validators.required],
      CalculatedPrice: [0],
      Quantity: [1],
      CategoryId: [null, Validators.required],
      TypeId: [null, Validators.required],
      ReceiptDate: [null, Validators.required],
      PurchaseDate: [null, Validators.required],
      DepreciationStartDate: [null],
      DepreciationCalculationStartDate: [null],
      DepreciationRate: [0],
      AssetAge: [0],
      AccumulatedDepreciation: [''],
      BookValue: [''],
      DepreciationValue: [''],
      DepartmentId: [''],
      FactionId: [''],
      ResponsibleEmployee: [''],
      PropertySeller: [''],
      TaxInvoiceNumber: [''],
      CreatedBy: [userId],
      SubAssets: this.fb.array([]),
      Unit: [''],
      Note: [''],
      StatusId: [4],
      numberOfCopies: [1, Validators.min(1)]
    });
  }

  syncCalculatedPrice(assetForm: FormGroup): void {
    const purchasePrice = assetForm.get('PurchasePrice')?.value || 0;
    assetForm.patchValue({ CalculatedPrice: purchasePrice });
  }

  autoInputFields(assetForm: FormGroup, userinfo: any, assetTypes: any[]): void {
    assetForm.get('Quantity')?.setValue(1);
    assetForm.get('CalculatedPrice')?.setValue(assetForm.get('PurchasePrice')?.value);
    assetForm.get('DepreciationCalculationStartDate')?.setValue(assetForm.get('ReceiptDate')?.value);
    assetForm.get('DepreciationStartDate')?.setValue(assetForm.get('ReceiptDate')?.value);
  
    const typeId = assetForm.get('TypeId')?.value;
    const matchingAssetType = assetTypes.find(asset => asset.TypeId === typeId);
    if (matchingAssetType) {
      assetForm.get('DepreciationRate')?.setValue(matchingAssetType.Rate_dep, { emitEvent: false });
      assetForm.get('AssetAge')?.setValue(matchingAssetType.Servicelife, { emitEvent: false });
    }
  
    if (userinfo.Affiliation === 'ส่วนกลาง') {
      assetForm.get('DepartmentId')?.setValue(userinfo.DepartmentId);
      assetForm.get('FactionId')?.setValue(userinfo.FactionId);
    }
  
    const assetCodeInput = assetForm.get('AssetCode');
    if (assetCodeInput && assetCodeInput.value && !assetCodeInput.value.startsWith('กกต')) {
      assetCodeInput.setValue(`กกต ${assetCodeInput.value}`);
    }
  }
  
  getSubAssets(assetForm: FormGroup): FormArray {
    return assetForm.get('SubAssets') as FormArray;
  }

  onReceiptDateChange(event: any, form: FormGroup): string {
    const selectedDate = event.value;
    if (selectedDate) {
      const isoDate = moment(selectedDate.clone().startOf('day').hours(8)).toISOString();
      form.patchValue({
        ReceiptDate: isoDate,
        DepreciationStartDate: isoDate,
        DepreciationCalculationStartDate: isoDate,
      }, { emitEvent: false });
      return moment(selectedDate).format('DD/MM/YY');
    }
    return '';
  }

  onPurchaseDateChange(event: any, form: FormGroup): void {
    const selectedDate = event.value;
    if (selectedDate) {
      const isoDate = moment(selectedDate.clone().startOf('day').hours(8)).toISOString();
      form.patchValue({ PurchaseDate: isoDate }, { emitEvent: false });
    }
  }

  handleAssetCodeInput(event: Event, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    const fixedPrefix = 'กกต 0401-';
    const fixedSuffix = '-2567';
    const editablePartLength = 3;

    let value = input.value;
    const regex = /^กกต\s\d{4}-\d{3}-\d{4}$/;

    if (!regex.test(value)) {
      input.value = form.get('AssetCode')!.value;
    } else {
      const editablePart = value.slice(fixedPrefix.length, fixedPrefix.length + editablePartLength);
      const newValue = `${fixedPrefix}${editablePart}${fixedSuffix}`;
      input.value = newValue;
      form.get('AssetCode')!.setValue(newValue);
    }
  }

  preventEditingFixedPart(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart!;
    if (cursorPosition < 10 || cursorPosition >= 13) {
      event.preventDefault();
    }
  }

  generateAssetCode(
    form: FormGroup,
    assetCategory: any[],
    assetDetails: any[],
    api: ApiService,
    showAlert: () => void,
    showError: (msg: string) => void,
    onSuccess?: () => void
  ): void {
    const category = assetCategory.find(cat => cat.CategoryId === form.get('CategoryId')?.value);
    const purchaseDate = form.get('PurchaseDate')?.value;
    const year = purchaseDate ? new Date(purchaseDate).getFullYear() + 543 : '';

    if (!category || !year) return showAlert();

    const payload = {
      Affiliation: 'กกต',
      AssetCategory: category.CategoryCode,
      Year: year.toString(),
    };

    api.assetService.generateAssetCode(payload).subscribe({
      next: res => {
        const code = this.handleGeneratedAssetCode(res?.assetCode, year.toString(), assetDetails);
        form.patchValue({ AssetCode: code });
        this.validateAssetCode(code, assetDetails);
        onSuccess?.();
      },
      error: () => showError('ไม่สามารถสร้างรหัสครุภัณฑ์ได้'),
    });
  }

  private handleGeneratedAssetCode(generatedCode: string, year: string, assetDetails: any[]): string {
    if (!generatedCode) return '';
    const base = generatedCode.split('-')[0];
    let suffix = 1;
    let finalCode = generatedCode;

    while (assetDetails.some(asset => asset.AssetCode === `${base}-${suffix}-${year}`)) {
      suffix++;
    }

    return suffix > 1 ? `${base}-${suffix}-${year}` : finalCode;
  }

  validateAssetCode(code: string, assetDetails: any[]): void {
    const isDuplicate = assetDetails.some(asset => asset.AssetCode === code);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: isDuplicate ? 'error' : 'success',
      html: `<span style="font-family: 'Anuphan'; font-weight: 700; color: ${isDuplicate ? 'red' : 'green'};">
        ${isDuplicate ? 'รหัสครุภัณฑ์ซ้ำ' : 'รหัสครุภัณฑ์ใช้ได้'}
      </span>`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }




}
