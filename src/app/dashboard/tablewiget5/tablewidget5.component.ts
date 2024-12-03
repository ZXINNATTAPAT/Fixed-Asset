import { Component, OnInit ,ChangeDetectorRef  } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ApiService } from 'src/app/api-service.service';


@Component({
  selector: 'app-tablewiget5',
  standalone: true,
  templateUrl: './tablewidget5.component.html',
  imports: [BaseChartDirective],
  styleUrls: ['./tablewidget5.component.scss']
})
export class Tablewidget5Component implements OnInit {
  public doughnutChartLabels: string[] = ['ปกติ', 'โอนย้าย', 'ซ่อมแซม', 'เลิกใช้งาน', 'รอซ่อม'];
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [],
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

  statusCounts: { [key: string]: number } = {}; 

  constructor(private ap: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  private loadChartData() {
    // this.ap.getStatusCounts().subscribe(
    //   (assets: any[]) => {
    //     this.statusCounts = assets.reduce((counts: { [key: string]: number }, asset: any) => {
    //       const status = asset.status || 'ปกติ';
    //       counts[status] = (counts[status] || 0) + 1;
    //       return counts;
    //     }, {});
  
    //     // Update the chart data to include the problem status
    //     this.doughnutChartData.datasets[0].data = [
    //       (this.statusCounts['ปกติ'] || 0) + (this.statusCounts[''] || 0), // Normal
    //       this.statusCounts['โอนย้าย'] || 0, // Transferred
    //       this.statusCounts['ซ่อมแซม'] || 0, // Repaired
    //       this.statusCounts['เลิกใช้งาน'] || 0, // Retired
    //       this.statusCounts['รอซ่อม'] || 0, // Waiting for repair
    //       this.statusCounts['มีปัญหา'] || 0, // Problematic
    //     ];
  
    //     // Force Angular to detect changes and update the chart
    //     this.cdr.detectChanges();
    //   },
    //   (error: any) => {
    //     console.error('Error fetching asset statuses:', error);
  
    //     // Handle error by resetting the chart data to defaults
    //     this.doughnutChartData.datasets[0].data = [0, 0, 0, 0, 0, 0];
    //     this.cdr.detectChanges();
    //   }
    // );
  }
  


}
