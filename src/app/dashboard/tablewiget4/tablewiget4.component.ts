import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import {TextColorDirective,TableModule,UtilitiesModule,ButtonDirective,} from '@coreui/angular';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ApiService } from '../../../ApiController/api-service.service';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective  } from 'ng2-charts';

interface AssetDetails {
  repairAssetId: any;
  assetCode: string;
  assetName:string;
  assetId: string;
  SerialNumber: string;
  Description: string;
  Amount: string;
}


@Component({
  selector: 'app-tablewiget4',
  standalone: true,
  imports: [
    BaseChartDirective,
    TextColorDirective,
    CommonModule,
    TableModule,
    NgxMatSelectSearchModule,
    MatButtonModule,
    UtilitiesModule,
    ButtonDirective,
    NgStyle,
],
  templateUrl: './tablewiget4.component.html',
  styleUrl: './tablewiget4.component.scss'
})
export class Tablewiget4Component implements OnInit {
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 5 // ให้มีช่วงบัฟบนสุด แม้ข้อมูลน้อย
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'จำนวนครุภัณฑ์ที่ซ่อมในแต่ละเดือน',
      },
    },
  };
  

  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartData: ChartDataset<'bar', number[]>[] = [
    { data: [], label: 'จำนวนครุภัณฑ์ที่ซ่อม' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://localhost:7204/api/RepairAsset').subscribe((data) => {
      const allMonths = [
        'ม.ค. 2025', 'ก.พ. 2025', 'มี.ค. 2025', 'เม.ย. 2025',
        'พ.ค. 2025', 'มิ.ย. 2025', 'ก.ค. 2025', 'ส.ค. 2025',
        'ก.ย. 2025', 'ต.ค. 2025', 'พ.ย. 2025', 'ธ.ค. 2025',
      ];
    
      const monthlyCount: { [key: string]: number } = {};
    
      data.forEach(item => {
        const date = new Date(item.Date);
        const key = date.toLocaleString('th-TH', { month: 'short', year: 'numeric' });
        monthlyCount[key] = (monthlyCount[key] || 0) + 1;
      });
    
      const monthsWithData = Object.keys(monthlyCount);
    
      if (monthsWithData.length <= 2) {
        // 🔹 แสดงเฉพาะเดือนที่มีข้อมูล
        this.barChartLabels = monthsWithData;
        this.barChartData[0].data = monthsWithData.map(month => monthlyCount[month]);
      } else {
        // 🔹 แสดงให้ครบ 12 เดือน (ดูสวยแต่โล่ง)
        this.barChartLabels = allMonths;
        this.barChartData[0].data = allMonths.map(month => monthlyCount[month] || 0);
      }
    });
    
    
  }
}
