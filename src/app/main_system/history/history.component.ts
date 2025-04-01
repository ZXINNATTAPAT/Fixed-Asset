import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ApiService } from '../../../ApiController/api-service.service';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public Id: any, // รับค่า assetId จาก Dialog
    private ap: ApiService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    // 👉 ใช้ค่า assetId จาก MAT_DIALOG_DATA
    if (this.Id?.id) {
      this.assetId = this.Id.id; // ใช้ค่า id จาก Dialog
      // console.log(this.assetId);
    }
    else {
      // ถ้าไม่มีค่า id จาก Dialog ให้ดึงจาก URL params แทน
      this.route.params.subscribe((params) => {
        if (params['assetId']) {
          this.assetId = params['assetId'];
        }
      });
    }

    // ดึงข้อมูลประวัติจาก API
    this.ap.fetchDatahttp('AssetDetailsAudit').pipe(
      map((response: any[]) => {
        return response.filter(item => item.AssetId === this.assetId);
      })
    ).subscribe(
      (filteredData) => {
        this.data = filteredData;
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดขณะดึงข้อมูล:', error);
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


