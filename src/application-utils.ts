import { FormControl } from "@angular/forms";

export const indexArrayByProperty = function (array: any[], property: string): any {
    return array.reduce((obj, item, index) => {
        obj[item[property]] = { item: item, index: index };
        return obj;
    }, {});
}

/**
 * Validator to check if the control value is an object
 * @param control Form control
 */
export function isObjectValidator(control: FormControl): any {
    return typeof control.value === "object" && control.value !== null ? null : { "notObject": true };
}

/**
 * Validator to check if a string value is blank
 * @param control Form control
 */
export function noWhitespaceValidator(control: FormControl): any {
    return (control.value || '').trim().length ? null : { "blank": true };
}