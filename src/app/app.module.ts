import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ResizableModule } from 'angular-resizable-element';
import {FormDirective,FormLabelDirective,FormControlDirective,ButtonDirective,} from '@coreui/angular';
import { appConfig } from './app.config'; // import appConfig จากไฟล์ app.config.ts
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BaseChartDirective } from 'ng2-charts';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AssetcountComponent } from './views/system2/assetcount/assetcount.component';
import { DemoMaterialModule } from './views/system2/assetcount/material-module';

// สร้าง InjectionToken เพื่อใช้ในการให้ค่า appConfig
export const APP_CONFIG = new InjectionToken<any>('app.config');

@NgModule({
  declarations: [
    AssetcountComponent
  ],
  imports: [
    BrowserModule,
    ResizableModule,
    HttpClientModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,
    ZXingScannerModule,
    BaseChartDirective,
    DemoMaterialModule,
    MatDialogModule,
    MatButtonModule,
  ],
  providers: [
    // ให้ APP_CONFIG มีค่าเป็น appConfig ที่เรา import เข้ามา
    { provide: APP_CONFIG, useValue: appConfig }
  ],
  bootstrap: []
})
export class AppModule { }
