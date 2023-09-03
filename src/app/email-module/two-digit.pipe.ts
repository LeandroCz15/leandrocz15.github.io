import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twoDigit'
})
export class TwoDigitPipe implements PipeTransform {

  transform(value : number): string {
    return value.toString().padStart(2, '0');
  }

}
