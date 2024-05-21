import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormControlDirective, FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AssetDetails2Component } from './views/system/asset-details2/asset-details2.component'
import { SystemComponent } from './views/system/asset-detail1/system.component';

import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { MatInputModule } from '@angular/material/input';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
// import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { cibAddthis, cilDataTransferDown, cilInfo, cilPencil, cilTrash } from '@coreui/icons';
import { MatOptionModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SingleSelectionComponent } from './views/system/single-selection/single-selection.component';
// import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [
    AppComponent,
    AssetDetails2Component,
    SystemComponent,
    SingleSelectionComponent
  ],
  imports: [
    MatDatepickerModule, 
    MatMomentDateModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepicker,
    MatInputModule,
    MatTableModule, 
    MatTabsModule, 
    MatSelectModule, 
    MatSelect, 
    MatOption, 
    MatOptionModule,
    MatFormFieldModule, 
    FormControlDirective,
    NgxMatSelectSearchModule, 
    MatToolbarModule,
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule, // Add ReactiveFormsModule here
    RouterModule.forRoot([])
  ],
  providers: [
    AuthGuard, DatePipe,
    MatDatepickerModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
