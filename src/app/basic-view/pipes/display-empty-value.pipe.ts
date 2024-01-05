import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayEmptyValue'
})
export class DisplayEmptyValuePipe implements PipeTransform {

  transform(value: any): any {
    return value == undefined || (typeof value === "string" && value.trim() === "") ? "--" : value;
  }

}
