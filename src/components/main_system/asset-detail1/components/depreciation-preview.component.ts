import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-depreciation-preview',
  standalone: true, // 👈 สำคัญ!!
  imports: [CommonModule, ReactiveFormsModule],
  template: `
 <div class="table-responsive mb-4" [formGroup]="formGroup">
  <h3><span class="anuphan-700">ตารางแสดงค่าเสื่อม</span></h3>
  <table class="table table-bordered table-striped shadow-sm">
    <tbody>
      <tr>
        <th colspan="4">
          <label class="form-label fw-bold" for="depreciationStartDateInput">
            วันที่เริ่มคิดค่าเสื่อม
          </label>
        </th>
        <th colspan="4">
          <label class="form-label fw-bold" for="depreciationCalculationStartDateInput">
            วันที่เริ่มคำนวณค่าเสื่อม
          </label>
        </th>
        <th colspan="4">
          <label class="form-label fw-bold" for="calculatedPriceInput">
            ราคาคำนวณ
          </label>
        </th>
        <th colspan="4">
          <label class="form-label fw-bold" for="depreciationRateInput">
            อัตราการคิดค่าเสื่อม(%)
          </label>
        </th>
        <th colspan="4">
          <label class="form-label fw-bold" for="assetAgeInput">
            อายุของครุภัณฑ์
          </label>
        </th>
      </tr>
      <tr>
        <td colspan="4">
          <input class="form-control p-1" id="depreciationStartDateInput"
            formControlName="DepreciationStartDate" [value]="formGroup.get('DepreciationStartDate')?.value | date:'dd/MM/yyyy'" readonly style="border: none;" />
        </td>
        <td colspan="4">
          <input class="form-control p-1" id="depreciationCalculationStartDateInput"
            formControlName="DepreciationCalculationStartDate" [value]="formGroup.get('DepreciationCalculationStartDate')?.value | date:'dd/MM/yyyy'" readonly style="border: none;" />
        </td>
        <td colspan="4">
          <input class="form-control p-1" id="calculatedPriceInput"
            formControlName="CalculatedPrice" placeholder="ระบุราคาคำนวณ" type="number" readonly style="border: none;" />
        </td>
        <td colspan="4">
          <input class="form-control p-1" id="depreciationRateInput"
            placeholder="ระบุอัตราการคิดค่าเสื่อม" type="number" formControlName="DepreciationRate" readonly style="border: none;" />
        </td>
        <td colspan="4">
          <input class="form-control p-1" id="assetAgeInput" placeholder="ระบุอายุของครุภัณฑ์"
            type="number" formControlName="AssetAge" readonly style="border: none;" />
        </td>
      </tr>
      <tr>
        <th colspan="4">
          <label class="form-label fw-bold" for="accumulatedDepreciationInput">
            ค่าเสื่อมสะสม
          </label>
        </th>
        <th colspan="4">
          <label class="form-label fw-bold" for="depreciationValueInput">
            มูลค่าค่าเสื่อม
          </label>
        </th>
        <th colspan="4"></th>
        <th colspan="4"></th>
        <th colspan="4"></th>
      </tr>
      <tr>
        <td colspan="4">
          <input class="form-control p-1" id="accumulatedDepreciationInput"
            formControlName="AccumulatedDepreciation" placeholder="ระบุค่าเสื่อมสะสม" type="number" readonly style="border: none;" />
        </td>
        <td colspan="4">
          <input class="form-control p-1" id="depreciationValueInput"
            formControlName="DepreciationValue" placeholder="ระบุมูลค่าค่าเสื่อม" type="number" readonly style="border: none;" />
        </td>
        <td colspan="4"></td>
        <td colspan="4"></td>
        <td colspan="4"></td>
      </tr>
    </tbody>
  </table>
</div>
  `,
  styles: [`
    .table-wrapper {
      margin-top: 1rem;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      text-align: center;
    }
  `],
})
export class DepreciationPreviewComponent {
  @Input() formGroup!: FormGroup;
  columns: string[] = ['year', 'depreciation', 'accumulatedDepreciation', 'bookValue'];
}
