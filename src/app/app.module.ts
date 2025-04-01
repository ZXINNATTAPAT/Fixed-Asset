import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ResizableModule } from 'angular-resizable-element';
import { ReactiveFormsModule } from '@angular/forms';

// CoreUI
import { FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, DropdownModule } from '@coreui/angular';

// ZXing Scanner
import { ZXingScannerModule } from '@zxing/ngx-scanner';

// Charts
import { BaseChartDirective } from 'ng2-charts';

// Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

// Components
import { AssetcountComponent } from './sub_system/assetcount/assetcount.component';
import { RoleDialogComponent } from './main_system/user-management/dialog/role-dialog.component';
import { UserEditDialogComponent } from './main_system/user-management/dialog/user-edit-dialog/user-edit-dialog.component';


// Config
import { appConfig } from './app.config';


// สร้าง InjectionToken เพื่อใช้ในการให้ค่า appConfig
export const APP_CONFIG = new InjectionToken<any>('app.config');

@NgModule({
  declarations: [
    AssetcountComponent,
    RoleDialogComponent,
    UserEditDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ResizableModule,
    ReactiveFormsModule,

    // CoreUI
    DropdownModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,

    // ZXing Scanner
    ZXingScannerModule,

    // Charts
    BaseChartDirective, // ✅ ใช้ NgChartsModule แทน BaseChartDirective

    // Angular Material
    MatDialogModule,
    MatButtonModule,
    MatSelectModule, // ✅ ใช้ MatSelectModule แทน MatSelect
  ],
  providers: [
    { 
      provide: APP_CONFIG, 
      useValue: appConfig 
    }
  ],
  bootstrap: [] // ✅ ควรเพิ่ม AppComponent ถ้าเป็น root module
})
export class AppModule { }
