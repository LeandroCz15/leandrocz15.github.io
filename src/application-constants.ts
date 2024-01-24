export const SERVER_URL = "http://localhost:8080/";

export const CAZZEON_DATE_FORMAT = {
    parse: {
        dateInput: 'YYYY-MM-DD',
    },
    display: {
        dateInput: 'YYYY-MM-DD',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
}

export const enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export const enum DataType {
    TEXT = "text",
    LARGE_TEXT = "lg-text",
    CHECKBOX = "checkbox",
    NATURAL = "natural",
    INTEGER = "integer",
    DECIMAL = "decimal",
    DATE = "date",
    SELECTOR = "selector",
}