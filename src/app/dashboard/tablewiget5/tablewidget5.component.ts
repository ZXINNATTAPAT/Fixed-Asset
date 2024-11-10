import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { ChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-tablewidget5',
  templateUrl: './tablewidget5.component.html',
  styleUrls: ['./tablewidget5.component.scss']
})
export class Tablewidget5Component implements OnInit {
  // ข้อมูลสถานะของสินทรัพย์
  public doughnutChartLabels: string[] = ['ปกติ', 'โอนย้าย', 'ซ่อมแซม', 'เลิกใช้งาน', 'รอซ่อม'];
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [45, 20, 15, 10, 10], // ข้อมูลตัวอย่างสำหรับแต่ละสถานะ
        backgroundColor: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d'],
      },
    ],
  };
  public doughnutChartType: ChartType = 'doughnut';
  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  constructor() {}

  ngOnInit(): void {}
}
