import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiCaseSwitch'
})
export class MultiCaseSwitchPipe implements PipeTransform {

  transform(value: string, ...args: string[]): string | undefined {
    return args.includes(value) ? value : undefined;
  }

}
