import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CAZZEON_DATE_FORMAT } from 'src/application-constants';
import { indexArrayByProperty } from 'src/application-utils';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css', './header.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CAZZEON_DATE_FORMAT }
  ]
})
export class HeaderComponent {

  // View component reference
  @Input() viewComponent!: ViewComponent;

  // Filters to render in this component
  @Input() filters!: Array<any>;

  // Element reference of the main div in the template
  @ViewChild("filterContainer") filterContainer!: ElementRef;

  // Service to reload the view
  @Input() reloadViewSubject!: Subject<any>;

  // Service to handle input change in the filters
  @Input() handleInputChangeSubject!: Subject<any>;

  /**
   * Function that handles the logic when a column filter is drag and dropped
   * @param event Event information about the column dropped
   */
  dropFilterColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.filters, event.previousIndex, event.currentIndex);
      const aux: number = this.filters.at(event.previousIndex).sequence;
      this.filters.at(event.previousIndex).sequence = this.filters.at(event.currentIndex).sequence;
      this.filters.at(event.currentIndex).sequence = aux;
      this.reloadViewSubject.next(null);
    }
  }

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
    this.handleInputChangeSubject.next(null);
  }

  // Custom function for checkbox change since [(ngModel)] doesn't seem to work properly
  processCheckBoxChange(index: number, newBoxValue: boolean): void {
    let changedFilter = this.filters.at(index);
    changedFilter.value = newBoxValue;
    this.handleInputChangeSubject.next(null);
  }

  // Date change processing
  processDateChange(event: any): void {
    if (!event.target.errorState) {
      this.handleInputChangeSubject.next(null);
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
    this.handleInputChangeSubject.next(null);
  }

  //Check if the text input of a filter changed
  didTextInputChange(filter: any) {
    return !(filter.value?.toUpperCase() === filter.lastValueUsedForSearch?.toUpperCase());
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}