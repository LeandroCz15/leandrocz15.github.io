import { Pipe, PipeTransform } from '@angular/core';
import { GridComponent } from '../components/grid/grid.component';

@Pipe({
  name: 'shouldShow'
})
export class ShouldShowPipe implements PipeTransform {

  transform(value: any, gridComponent: GridComponent): unknown {
    return gridComponent.currentGridFieldsIndexedByHqlProperty[value.key];
  }

}
