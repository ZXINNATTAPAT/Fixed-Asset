import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ApiService } from 'src/app/api-service.service';
import { IconDirective } from '@coreui/icons-angular';
import { cilPencil } from '@coreui/icons';

@Component({
  selector: 'app-history',
  standalone: true,
  providers: [DatePipe],
  imports: [CommonModule,IconDirective],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {

  data:any =[];
  icons ={cilPencil}


  constructor(private ap:ApiService, private route: ActivatedRoute){}

  ngOnInit() {
    // ดึงค่า assetId จาก URL
    const assetId = this.route.snapshot.paramMap.get('assetId') || '';

    this.ap.fetchDatahttp('AssetDetailsAudit').pipe(
      map((response: any[]) => {
        // กรองข้อมูลและสร้างอาร์เรย์ใหม่ที่มีแค่ค่า assetId
        return response.filter(item => item.assetId === parseInt(assetId, 10));
      })
    ).subscribe(
      (filteredData) => {
        this.data = filteredData;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formattedDate ?? '';
  }

  

}
