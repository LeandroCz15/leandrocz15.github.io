export const CAZZEON_DATE_FORMAT = {
    parse: {
        dateInput: 'YYYY/MM/DD',
    },
    display: {
        dateInput: 'YYYY/MM/DD',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
}

export const enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH"
}

export const enum DataType {
    TEXT = "text",
    CHECKBOX = "checkbox",
    NUMERIC = "number",
    DATE = "date",
}