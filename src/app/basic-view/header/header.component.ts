import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

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
      let obj: any = {};
      for (let i = 0; i < this.filters.length; i++) {
        obj[this.filters.at(i).hqlProperty] = i;
      }
      this.reloadViewSubject.next(obj);
    }
  }

  // Process text input change
  processTextInputChange(index: number): void {
    let changedFilter = this.filters.at(index);
    // Only triggers when detect changes in the input
    if (changedFilter.value === changedFilter.lastValueUsedForSearch
      || (changedFilter.value.trim() === "" && changedFilter.value.length !== 0)) {
      return;
    }
    // Change last value used to search
    changedFilter.lastValueUsedForSearch = changedFilter.value;
    this.handleInputChangeSubject.next(null);
  }

  // Custom function for checkbox change since [(ngModel)] doesn't seem to work properly
  processCheckBoxChange(index: number, newBoxValue: boolean) {
    let changedFilter = this.filters.at(index);
    // Change last value used to search
    changedFilter.lastValueUsedForSearch = changedFilter.value;
    changedFilter.value = newBoxValue;
    this.handleInputChangeSubject.next(null);
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}