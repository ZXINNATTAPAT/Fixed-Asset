import { Component, NgModule, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormControlDirective, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import {debounceTime, delay, tap, filter, map, takeUntil, take} from 'rxjs/operators';

import { Bank, BANKS } from '../demo-data';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ButtonDirective, FormDirective, FormLabelDirective, FormModule, FormSelectDirective } from '@coreui/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgStyle } from '@angular/common';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'app-single-selection',
  standalone: true,
  imports: [MatFormField , MatSelect ,MatOption ,NgxMatSelectSearchModule ,FormModule, FormSelectDirective,
    MatFormFieldModule,CommonModule,FormsModule, FormDirective, FormLabelDirective,FormSelectDirective,NgxMatSelectSearchModule,
    ButtonDirective, NgStyle ,CommonModule, MatCommonModule,ReactiveFormsModule
  ],
  templateUrl: './single-selection.component.html',
  styleUrl: './single-selection.component.scss'
})
export class SingleSelectionComponent implements OnDestroy , OnInit  {

  /** list of banks */
  protected banks: Bank[] = BANKS;

  /** control for the selected bank */
  public bankCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public bankFilterCtrl: FormControl = new FormControl();

  /** list of banks filtered by search keyword */
  public filteredBanks: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

  @ViewChild('singleSelect') singleSelect!: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();


  constructor() { }

  ngOnInit() {
    // set initial selection
    this.bankCtrl.setValue(this.banks[10]);

    // load the initial bank list
    this.filteredBanks.next(this.banks.slice());

    // listen for search field value changes
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanks();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    this.filteredBanks
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {

        this.singleSelect.compareWith = (a: Bank, b: Bank) => a && b && a.id === b.id;
      });
  }

  protected filterBanks() {
    if (!this.banks) {
      return;
    }
    // get the search keyword
    let search = this.bankFilterCtrl.value;
    if (!search) {
      this.filteredBanks.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanks.next(
      this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }

}
