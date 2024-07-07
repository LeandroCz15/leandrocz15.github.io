import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showIf'
})
export class ShowIfPipe implements PipeTransform {

  transform(value: string, component: any): boolean {
    console.log("EVALUANDO")
    try {
      return value ? eval(value) : true;
    } catch(error) {
      console.error(error);
      return true;
    }
  }

}
