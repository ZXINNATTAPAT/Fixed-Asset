import { Component } from '@angular/core';
import {
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { NgStyle } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { AssetDetails2Component } from '../asset-details2/asset-details2.component';
import { AssetDetails3Component } from '../asset-details3/asset-details3.component';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editasset-detail',
  standalone: true,
  imports: [
    AssetDetails2Component,
    AssetDetails3Component,
    TextColorDirective,
    MatTabsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ReactiveFormsModule,
    FormsModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
  ],
  templateUrl: './editasset-detail.component.html',
  styleUrls: ['./editasset-detail.component.scss'], // Fixed typo: `styleUrl` -> `styleUrls`
})
export class EditassetDetailComponent {
  isEditMode: boolean = false; // Explicitly typed
  oldasset: any = {}; // Explicitly initialized

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const assetId = params['assetId'];
      console.log(assetId); // Debugging log

      if (assetId) {
        this.fetchAssetDetails(assetId);
      }
    });
  }

  private fetchAssetDetails(assetId: string): void {
    this.http
      .get<any>(`https://localhost:7204/api/AssetDetails/${assetId}`, { withCredentials: true })
      .subscribe(
        (response) => {
          this.oldasset = response;
          console.log(this.oldasset); // Debugging log
        },
        (error) => {
          console.error(error);
          // Handle error as needed
        }
      );
  }

  autoInput(event: KeyboardEvent): void {
    const assetCodeInput = document.getElementById('assetCodeInput') as HTMLInputElement;
    if (event.target === assetCodeInput) {
      const currentValue = assetCodeInput.value;
      if (!currentValue.startsWith('กกต')) {
        assetCodeInput.value = 'กกต ' + currentValue;
      }
    }
  }

  handleKeyPress(event: KeyboardEvent, nextInputId: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onSubmit(): void {
    this.http
      .put<any>(
        `https://localhost:7204/api/AssetDetails/${this.oldasset.assetId}`,
        this.oldasset,
        { withCredentials: true }
      )
      .subscribe(
        (response) => {
          console.log(response);
          Swal.fire({
            title: 'บันทึกเสร็จสิ้น',
            icon: 'success',
          }).then((result) => {
            if (result.isConfirmed) {
              window.history.back();
            }
          });
        },
        (error) => {
          console.error(error);
          Swal.fire({
            title: 'มีข้อมูลในระบบอยู่แล้ว',
            icon: 'error',
          });
        }
      );
  }
}
