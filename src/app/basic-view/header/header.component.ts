import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CAZZEON_DATE_FORMAT } from 'src/application-constants';
import { FetchRowsService } from '../services/fetch-rows.service';
import { indexArrayByProperty } from 'src/application-utils';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', './header.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CAZZEON_DATE_FORMAT }
  ],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {

  // View component reference
  @Input() viewComponent!: ViewComponent;

  // Filters to render in this component
  @Input() filters!: Array<any>;

  constructor(private fetchRows: FetchRowsService) { }

  // Process text input change
  processTextInputChange(index: number): void {
    let changedFilter = this.filters.at(index);
    // Only triggers when detect changes in the input
    let trimmedValue: string = changedFilter.value?.trim();
    if (!this.didTextInputChange(changedFilter) || trimmedValue === "" && changedFilter.value?.length !== 0) {
      return;
    }
    // Change last value used to search
    changedFilter.lastValueUsedForSearch = trimmedValue;
    changedFilter.value = trimmedValue;
    this.fetchRows.sendFetchChange();
  }

  // Process boolean input change
  processCheckBoxChange(index: number, newCheckValue: boolean): void {
    // Property binding not working with check's so update the value manually
    this.filters.at(index).value = newCheckValue;
    this.fetchRows.sendFetchChange();
  }

  // Process date input change
  processDateChange(event: any): void {
    if (!event.target.errorState) {
      this.fetchRows.sendFetchChange();
    }
  }

  // Process numeric input change
  processNumericInputChange(index: number): void {
    let changedFilter = this.filters.at(index);
    changedFilter.value = changedFilter.value?.trim();
    if (!this.didTextInputChange(changedFilter)) {
      changedFilter.invalidExpression = false;
      return;
    }
    if (changedFilter.value === "") {
      // EMPTY PREDICATE
      changedFilter.operator = undefined;
      changedFilter.number = undefined;
      changedFilter.invalidExpression = false;
    } else {
      let numericValue = +changedFilter.value;
      if (!isNaN(numericValue)) {
        // SIMPLE NUMERIC VALUE
        changedFilter.operator = undefined;
        changedFilter.number = numericValue;
        changedFilter.invalidExpression = false;
      } else {
        // SPECIAL NUMERIC VALUE
        const regex = /(>=|<=|<|>|==|!=)\s*(-?\d+(\.\d{1,2})?)/;
        const match = changedFilter.value.match(regex);
        if (!match) {
          changedFilter.invalidExpression = true;
          return;
        }
        changedFilter.operator = match[1];
        changedFilter.number = match[2];
      }
    }
    changedFilter.lastValueUsedForSearch = changedFilter.value;
    this.fetchRows.sendFetchChange();
  }

  didTextInputChange(filter: any) {
    return !(filter.value?.toUpperCase() === filter.lastValueUsedForSearch?.toUpperCase());
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

}