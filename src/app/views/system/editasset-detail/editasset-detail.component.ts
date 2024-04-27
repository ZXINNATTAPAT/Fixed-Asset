import { Component } from '@angular/core';
import { TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent } from '@coreui/angular';
import { NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
import {AssetDetails2Component} from '../asset-details2/asset-details2.component'
import Swal from 'sweetalert2'
import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editasset-detail',
  standalone: true,
    imports: [
        AssetDetails2Component,
        AssetDetails3Component,
        TextColorDirective,
        // RouterLink,
        MatTabsModule,
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
        ButtonDirective, NgStyle],
  templateUrl: './editasset-detail.component.html',
  styleUrl: './editasset-detail.component.scss'
})

export class EditassetDetailComponent {
  isEditMode: any;
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

  // asset: any = {  }; // สร้าง object เพื่อเก็บข้อมูลสินทรัพย์ที่ผู้ใช้ป้อน
 

  constructor(private http: HttpClient , private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const assetId = params['assetId'];
      console.log(assetId); // ตรวจสอบว่าค่า assetId ถูกต้องหรือไม่

      // ถ้าค่า assetId ไม่เป็น undefined หรือ null ให้เรียก API เพื่อดึงข้อมูลของ asset
      if (assetId) {
        this.http.get<any>('https://localhost:7204/api/AssetDetails/' + assetId)
          .subscribe(
            response => {
              // กำหนดค่าของ oldasset เมื่อได้รับข้อมูลกลับมา
              this.oldasset = response;
              console.log(this.oldasset);
            },
            error => {
              console.error(error);
              // ใส่โค้ดสำหรับจัดการ error ตามต้องการ
            }
          );
      }
    });
  }

  

  
  oldasset:any ={};

  onSubmit(): void {
    // ส่งข้อมูลสินทรัพย์ไปยัง API ด้วย HttpClient
    this.http.put<any>(`https://localhost:7204/api/AssetDetails/${this.oldasset.assetId}` ,this.oldasset)
      .subscribe(
        response => {
          console.log(response);
          Swal.fire({
            title: "บันทึกเสร็จสิ้น",
            icon: "success"
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href="/#/system/Asset-table";
            }
          });
        },
        error => {
          console.error(error);
          if(error){
            Swal.fire({
              title: "มีข้อมูลในระบบอยู่แล้ว",
              icon: "error"
            }).then((result) => {
              if (result.isConfirmed) {
                // window.location.reload();
              }
            });
          }
          
        }
      );
  }

  
}

 
