import { DOCUMENT, NgStyle } from '@angular/common';
import { Component, DestroyRef, effect, inject, NgModule, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';

import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { HoneycombComponent } from '../dashboard/honeycomb/honeycomb.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/api-service.service';
import { AssetTableComponent } from "../system/asset-table/asset-table.component";
import { TablewigetComponent } from "../dashboard/tablewiget/tablewiget.component"
import { Tablewiget2Component} from "../dashboard/tablewiget2/tablewiget2.component"
import { Tablewiget3Component} from "../dashboard/tablewiget3/tablewiget3.component"
import { ChartsComponent } from "../charts/charts.component";
import {DataService} from '../../data-service/data-service.component'

// interface IUser {
//   name: string;
//   state: string;
//   registered: string;
//   country: string;
//   usage: number;
//   period: string;
//   payment: string;
//   activity: string;
//   avatar: string;
//   status: string;
//   color: string;
// }

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    standalone: true,
    imports: [WidgetsDropdownComponent, TextColorDirective, 
      CardComponent, CardBodyComponent, RowComponent, ColComponent, 
      ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, 
      ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressBarDirective, 
      ProgressComponent, WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent, AssetTableComponent, 
      TablewigetComponent,Tablewiget2Component,Tablewiget3Component ,ChartsComponent ,HoneycombComponent]
})

export class DashboardComponent implements OnInit {

  // readonly #destroyRef: DestroyRef = inject(DestroyRef);
  
  // readonly #document: Document = inject(DOCUMENT);
  
  // readonly #renderer: Renderer2 = inject(Renderer2);
  
  // readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);

  assetDetails: any = [];

  assetcom:string='';

  numberOfAssets!:number;

  constructor(private apiService: ApiService,private dataService: DataService) {}

  // public mainChart: IChartProps = { type: 'line' };
  // public mainChartRef: WritableSignal<any> = signal(undefined);
  // #mainChartRefEffect = effect(() => {
  //   if (this.mainChartRef()) {
  //     this.setChartStyles();
  //   }
  // });
  // public chart: Array<IChartProps> = [];
  // public trafficRadioGroup = new FormGroup({
  //   trafficRadio: new FormControl('Month')
  // });

  ngOnInit(): void {
    // this.initCharts();
    // this.updateChartOnColorModeChange();
    this.numberOfAssets = this.dataService.getNumberOfAssets();
  }

  // initCharts(): void {
  //   this.mainChart = this.#chartsData.mainChart;
  // }

  // setTrafficPeriod(value: string): void {
  //   this.trafficRadioGroup.setValue({ trafficRadio: value });
  //   this.#chartsData.initMainChart(value);
  //   this.initCharts();
  // }

  // handleChartRef($chartRef: any) {
  //   if ($chartRef) {
  //     this.mainChartRef.set($chartRef);
  //   }
  // }

  // updateChartOnColorModeChange() {
  //   const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
  //     this.setChartStyles();
  //   });

  //   this.#destroyRef.onDestroy(() => {
  //     unListen();
  //   });
  // }

  // setChartStyles() {
  //   if (this.mainChartRef()) {
  //     setTimeout(() => {
  //       const options: ChartOptions = { ...this.mainChart.options };
  //       const scales = this.#chartsData.getScales();
  //       this.mainChartRef().options.scales = { ...options.scales, ...scales };
  //       this.mainChartRef().update();
  //     });
  //   }
  // }
}
