import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'generateIdForForm'
})
export class GenerateIdForFormPipe implements PipeTransform {

  transform(value: string): string {
    return "form_" + value.replaceAll(".", "_");
  }

}
