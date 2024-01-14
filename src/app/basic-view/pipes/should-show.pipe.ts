import { Pipe, PipeTransform } from '@angular/core';
import { ViewComponent } from '../view/view.component';

@Pipe({
  name: 'shouldShow'
})
export class ShouldShowPipe implements PipeTransform {

  transform(value: any, viewComponent: ViewComponent): unknown {
    return viewComponent.currentGridFieldsIndexedByHqlProperty[value.key];
  }

}
