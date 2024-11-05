import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ResizableModule } from 'angular-resizable-element';
import {
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { appConfig } from './app.config'; // import appConfig จากไฟล์ app.config.ts
import { ZXingScannerModule } from '@zxing/ngx-scanner';


// สร้าง InjectionToken เพื่อใช้ในการให้ค่า appConfig
export const APP_CONFIG = new InjectionToken<any>('app.config');

@NgModule({
  declarations: [
    
  ],
  imports: [
    BrowserModule,
    ResizableModule,
    HttpClientModule,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    ButtonDirective,
    ZXingScannerModule
  ],
  providers: [
    // ให้ APP_CONFIG มีค่าเป็น appConfig ที่เรา import เข้ามา
    { provide: APP_CONFIG, useValue: appConfig }
  ],
  bootstrap: []
})
export class AppModule { }
