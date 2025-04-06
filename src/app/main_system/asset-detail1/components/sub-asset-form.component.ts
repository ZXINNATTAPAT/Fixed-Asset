import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormService } from '../Service/form.service';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sub-asset-form',
  standalone: true,
  imports: [MatIcon,MatLabel,MatFormField,CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="subAssetForm" class="card shadow-sm mb-3" style="border: none;">
      <div class="card-body">
        <div class="anuphan-600 mb-3" style="font-size: large; font-weight: bold;">ครุภัณฑ์ย่อย</div>
        <div class="row m-1">
          <div class="col-3">
            <label class="form-label" for="subAssetCode{{ index }}">รหัสครุภัณฑ์ย่อย</label>
            <input type="text" class="form-control" id="subAssetCode{{ index }}" formControlName="subAssetCode" readonly />
          </div>

          <div class="col-3">
            <label class="form-label" for="subAssetName{{ index }}">ชื่อครุภัณฑ์ย่อย</label>
            <input type="text" class="form-control" id="subAssetName{{ index }}" formControlName="subAssetName" />
          </div>

          <div class="col-2">
            <label class="form-label" for="unit{{ index }}">หน่วยนับ</label>
            <input type="text" class="form-control" id="unit{{ index }}" formControlName="unit" />
          </div>

          <div class="col-3">
            <label class="form-label" for="note{{ index }}">หมายเหตุ</label>
            <input type="text" class="form-control" id="note{{ index }}" formControlName="note" />
          </div>

          <div class="col-1 d-flex align-items-end">
            <button type="button" class="btn btn-danger w-100" (click)="remove()">ลบ</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sub-asset-form {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .w-25 {
      flex: 1 1 22%;
      min-width: 200px;
    }
  `],
})
export class SubAssetFormComponent implements OnInit {
  @Input() subAssetForm!: FormGroup;
  @Input() index!: number;
  @Input() onRemove!: (index: number) => void;

  constructor(public formService: FormService) {}

  ngOnInit(): void {}

  remove(): void {
    if (this.onRemove) this.onRemove(this.index);
  }
}
