import { Pipe, PipeTransform } from '@angular/core';
import { RowsComponent } from '../rows/rows.component';

@Pipe({
  name: 'shouldShow'
})
export class ShouldShowPipe implements PipeTransform {

  /**
   * 
   * @param index Index to check
   * @param rowComponent RowComponent object to reference the header component filters
   * @returns True if the current row should be rendered or not based on it's index
   */
  transform(index: number, rowComponent: RowsComponent): unknown {
    return rowComponent.viewComponent.headerComponent.filters.at(index).showInGrid;
  }

}
