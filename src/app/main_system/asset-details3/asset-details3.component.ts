import { Component } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';

@Component({
    selector: 'app-form-controls-3',
    templateUrl: 'asset-Details3.Component.html',
    standalone: true,
    imports: [
        TextColorDirective,
        CardComponent,
        CardHeaderComponent,
        CardBodyComponent,
        RowComponent, 
        ColComponent, 
        TextColorDirective, 
        CardComponent, 
        CardHeaderComponent, 
        CardBodyComponent, 
        // DocsExampleComponent, 
        ReactiveFormsModule, 
        FormsModule, 
        FormDirective, 
        FormLabelDirective, 
        FormControlDirective, 
        ButtonDirective, NgStyle]
})
export class AssetDetails3Component {
  autoInput(event: KeyboardEvent) {
    const assetCodeInput = document.getElementById('assetCodeInput') as HTMLInputElement;
    if (event.target === assetCodeInput) {
        // เมื่อผู้ใช้พิมพ์บน input assetCodeInput
        const currentValue = assetCodeInput.value;
        if (!currentValue.startsWith('กกต')) {
            // ถ้าข้อมูลที่ป้อนไม่ได้เริ่มด้วย 'กกต.นศ'
            assetCodeInput.value = 'กกต ' + currentValue;
        }
    }
  }

  handleKeyPress(event: KeyboardEvent, nextInputId: string) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
  }

  constructor() {}
}

