import { Component, OnInit } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'

@Component({
    selector: 'app-form-controls2',//ไว้เรียกใช้ในหน้าอื่นนได้++++
    templateUrl: 'asset-Details2.Component.html',
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
export class AssetDetails2Component implements OnInit {

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


  onserch():void{
    
  }

  ngOnInit(): void { }


  asset: any = {}; 

  onSubmit(): void {
    this.http.post<any>('https://localhost:7204/api/AssetDetails2', this.asset)
      .subscribe(
        response => {
          console.log(response);
          Swal.fire({
            title: "บันทึกเสร็จสิ้น",
            icon: "success"
          });
        },
        error => {
          console.error(error);
          if (error) {
            Swal.fire({
              title: "มีข้อมูลในระบบอยู่แล้ว",
              icon: "error"
            });
          }
        }
      );
  }

  constructor(private http: HttpClient,) {}
}

