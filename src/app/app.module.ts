import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; 

import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard'; 
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {AssetDetails2Component} from './views/system/asset-details2/asset-details2.component'

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';

import { MatInputModule } from '@angular/material/input';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    AssetDetails2Component
  ],
  imports: [
    MatDatepickerModule,MatMomentDateModule,MatFormFieldModule,MatInputModule,MatDatepicker,

    MatInputModule,MatTableModule,MatTabsModule,
   
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule, // Add ReactiveFormsModule here
    RouterModule.forRoot([])
  ],
  providers: [
    AuthGuard,DatePipe,
    MatDatepickerModule, 
    
    // { provide: LOCALE_ID, useValue: "th-TH" }
  // กำหนด locale เป็น 'th-TH' (ภาษาไทย)
    // { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } } // กำหนดให้ Moment.js ใช้งานในโหมด UTC
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
