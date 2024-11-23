import { NgStyle } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { WidgetsBrandComponent } from '@widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '@widgets/widgets-dropdown/widgets-dropdown.component';
import { AssetTableComponent } from '../views/system/asset-table/asset-table.component';

import { TablewigetComponent } from './tablewiget/tablewiget.component';
import { Tablewiget2Component } from './tablewiget2/tablewiget2.component';
import { Tablewiget3Component } from './tablewiget3/tablewiget3.component';
import { Tablewiget4Component } from './tablewiget4/tablewiget4.component';
import { Tablewidget5Component } from './tablewiget5/tablewidget5.component';
import { DataService } from '../data-service/data-service.component';

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
    Tablewiget4Component,
    Tablewidget5Component,
    AssetTableComponent
  ],
})

export class DashboardComponent implements OnInit {
  
  assetDetails: any = [];

  assetcom: string = '';

  numberOfAssets!: number;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.numberOfAssets = this.dataService.getNumberOfAssets();
  }
}
