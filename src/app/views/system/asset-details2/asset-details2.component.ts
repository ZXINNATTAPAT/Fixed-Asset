import { Component, OnInit } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { DocsExampleComponent } from '@docs-components/public-api';

import { ApiService } from '../../../api-service.service';
import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective ,FormSelectDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'

@Component({
    selector: 'app-form-controls2',//ไว้เรียกใช้ในหน้าอื่นนได้++++
    templateUrl: 'asset-Details2.Component.html',
    standalone: true,
    imports: [
        CommonModule,FormSelectDirective,
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

  assetDetails:any =[];
  assetCodes: string[] = [];
  

  getAssetDetails(): void {
    this.apiService.fetchData('assetDetails').catch((data: any[]) => {
        this.assetDetails = data.map(asset => {
            return {
                assetCode: asset.assetCode,
                assetId: asset.assetId
            };
        });
        // สร้างอาเรย์ของ assetCode
        this.assetCodes = this.assetDetails.map((asset: { assetCode: any; }) => asset.assetCode);
        // console.log(this.assetDetails);
    });
}
  

 assetCode :string ='';

  ngOnInit(): void {
    this.getAssetDetails();
  }

  onSearch(): void {
    const foundAsset = this.assetDetails.find((asset: { assetCode: string; }) => asset.assetCode === this.assetCode);
    if (foundAsset) {
      this.asset.assetId = foundAsset.assetId; // กำหนดค่า assetId ให้กับตัวแปร asset
    } else {
      console.log('Asset not found');
    }
  }

  asset: any = {
    assetId: ''
  }; 

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
            console.log(this.asset);
          }
        }
      );
  }

  constructor(private http: HttpClient,private apiService: ApiService) {}
}

