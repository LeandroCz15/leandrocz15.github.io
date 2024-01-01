import { Pipe, PipeTransform } from '@angular/core';
import { RowsComponent } from '../rows/rows.component';

@Pipe({
  name: 'shouldShow'
})
export class ShouldShowPipe implements PipeTransform {

  transform(value: any, rowComponent: RowsComponent): unknown {
    return rowComponent.viewComponent.currentGridFieldsIndexedByHqlProperty[value.key];
  }

}
