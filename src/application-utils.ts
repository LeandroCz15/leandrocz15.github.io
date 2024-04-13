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
    return typeof control.value === "object" || control.value === null ? null : { "notObject": true };
}

/**
 * Validator to check if a string value is blank
 * @param control Form control
 */
export function noWhitespaceValidator(control: FormControl): any {
    return (control.value || '').trim().length ? null : { "blank": true };
}

export function getServerUrl(): string {
    // Return default tomcat deploy url or just normal href
    return window.location.hostname === "localhost" ? "http://localhost:8080/" : window.location.href;
}

export interface ServerResponse {
    message: string,
    httpStatus: string,
    body: any,
    exceptionStackTrace: string,
    refreshGrid: boolean
}