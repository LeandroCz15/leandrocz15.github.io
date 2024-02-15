import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CAZZEON_DATE_FORMAT } from 'src/application-constants';
import { TabData } from '../../interfaces/tab-structure';
import { Subject } from 'rxjs';

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

  /********************** INPUTS  **********************/
  @Input() tabData!: TabData;

  /********************** SUBJECTS  **********************/
  @Input() doFetchSubject!: Subject<number | undefined>;

  constructor() { }

  // Process text input change
  processTextInputChange(index: number): void {
    const changedFilter = this.tabData.gridFields.at(index);
    // Only triggers when detect changes in the input
    const trimmedValue: string = changedFilter.value?.trim();
    if (!this.didTextInputChange(changedFilter) || trimmedValue === "" && changedFilter.value?.length !== 0) {
      return;
    }
    // Change last value used to search
    changedFilter.lastValueUsedForSearch = trimmedValue;
    changedFilter.value = trimmedValue;
    this.doFetchSubject.next(undefined);
  }

  // Process boolean input change
  processCheckBoxChange(index: number): void {
    // Property binding not working with check's so update the value manually
    const checkboxField = this.tabData.gridFields.at(index);
    let valueToChange;
    switch (checkboxField.value) {
      case undefined:
        valueToChange = true;
        break;
      case true:
        valueToChange = false;
        break;
      case false:
        valueToChange = undefined;
        break;
      default:
        valueToChange = undefined;
        break;
    }
    checkboxField.value = valueToChange;
    this.doFetchSubject.next(undefined);
  }

  // Process date input change
  processDateChange(event: any): void {
    if (!event.target.errorState) {
      this.doFetchSubject.next(undefined);
    }
  }

  // Process numeric input change
  processNumericInputChange(index: number): void {
    let changedFilter = this.tabData.gridFields.at(index);
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
    this.doFetchSubject.next(undefined);
  }

  /**
   * Check if the filter has been modified or not
   * @param filter Filter to check if it's value has been modified
   * @returns True if the value has been modified. False otherwise
   */
  didTextInputChange(filter: any) {
    return !(filter.value?.toUpperCase() === filter.lastValueUsedForSearch?.toUpperCase());
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

}