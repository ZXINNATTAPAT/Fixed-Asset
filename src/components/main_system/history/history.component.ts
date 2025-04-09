import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ApiService } from '../../../ApiController/apiservice/api-service.service';
import { IconDirective } from '@coreui/icons-angular';
import { cilPencil } from '@coreui/icons';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-history',
  standalone: true,
  providers: [DatePipe],
  imports: [CommonModule, IconDirective],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {

  assetId!: number;
  data: any[] = [];
  icons = { cilPencil };

  // Use inject() to get MAT_DIALOG_DATA
  private dialogData = inject(MAT_DIALOG_DATA);

  constructor(
    private ap: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 👉 Use assetId from MAT_DIALOG_DATA
    if (this.dialogData?.id) {
      this.assetId = this.dialogData.id; // Use id from Dialog
    } else {
      // If no id from Dialog, get it from URL params
      this.route.params.subscribe((params) => {
        if (params['assetId']) {
          this.assetId = params['assetId'];
        }
      });
    }

    // Fetch history data from API
    this.ap.assetService.fetchData('AssetDetailsAudit').pipe(
      map((response: any[]) => {
        return response.filter(item => item.AssetId === this.assetId);
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
    return date.toLocaleDateString('th', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) ?? '';
  }
}


