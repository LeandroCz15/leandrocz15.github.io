import { Pipe, PipeTransform } from '@angular/core';
import { RowsComponent } from '../rows/rows.component';
import { ViewComponent } from '../view/view.component';

@Pipe({
  name: 'shouldShow'
})
export class ShouldShowPipe implements PipeTransform {

  transform(value: any, viewComponent: ViewComponent): unknown {
    return viewComponent.currentGridFieldsIndexedByHqlProperty[value.key];
  }

}
