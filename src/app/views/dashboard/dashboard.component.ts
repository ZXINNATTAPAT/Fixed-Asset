import { NgStyle } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { WidgetsBrandComponent } from '@widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '@widgets/widgets-dropdown/widgets-dropdown.component';
import { AssetTableComponent } from '../system/asset-table/asset-table.component';

import { TablewigetComponent } from '@dashboard/tablewiget/tablewiget.component';
import { Tablewiget2Component } from '@dashboard/tablewiget2/tablewiget2.component';
import { Tablewiget3Component } from '@dashboard/tablewiget3/tablewiget3.component';

import { DataService } from '../../data-service/data-service.component';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    WidgetsDropdownComponent,
    NgStyle,
    WidgetsBrandComponent,
    AssetTableComponent,
    TablewigetComponent,
    Tablewiget2Component,
    Tablewiget3Component,
  ],
})

export class DashboardComponent implements OnInit {
  assetDetails: any = [];
  assetcom: string = '';
  numberOfAssets!: number;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.numberOfAssets = this.dataService.getNumberOfAssets();
  }
}
