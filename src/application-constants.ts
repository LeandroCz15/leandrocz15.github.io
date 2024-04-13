/**
 * Date format of the application. This object serves for displaying the date in the date pickers of angualar material
 */
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

/**
 * Configuration object of the tabs modal
 */
export const TABS_MODAL = {
    defaultHeight: "80%",
    defaultWidth: "80%"
}

/**
 * Configuration object of the modal with the information about the stacktrace error. 
 * 
 * This modal is opened when the user clicks the button of the snackbar in case of error while saving, updating or deleting an entity
 */
export const STACK_TRACE_MODAL = {
    defaultHeight: "60%",
    defaultWidth: "60%"
}

/**
 * Configuration object of the snackbars displayed when there is a response from the backend while saving, updating or deleting an entity
 */
export const SNACKBAR = {
    defaultErrorDuration: 6000,
    defaultSuccessDuration: 3000,
    defaultErrorIcon: "🗿",
    defaultNoMoreDataMessage: "No more data to show"
}

/**
 * Configuration object of the context menu displayed when right clicking a row
 */
export const CONTEXT_MENU = {
    actionsLabel: "Actions",
    actionsIcon: "bi-cpu",
    tabsLabel: "Tabs",
    tabsIcon: "bi-journals",
    deleteLabel: "Delete",
    deleteIcon: "bi-trash"
}

/**
 * Configuration object of the view finder
 */
export const VIEW_FINDER = {
    defaultWidthPcntg: 60,
    defaultDebounceTime: 750
}

export const HQL_PROPERTY = "hqlProperty";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export enum DataType {
    TEXT = "text",
    LARGE_TEXT = "lg-text",
    CHECKBOX = "checkbox",
    NATURAL = "natural",
    INTEGER = "integer",
    DECIMAL = "decimal",
    DATE = "date",
    SELECTOR = "selector",
}

export enum LoginStatus {
    LOGIN,
    LOGOUT
} 