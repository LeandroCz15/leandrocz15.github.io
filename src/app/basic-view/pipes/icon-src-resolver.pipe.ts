import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iconSrcResolver'
})
export class IconSrcResolverPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.includes("/");
  }

}
