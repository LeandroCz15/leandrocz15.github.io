/**
 * Configuration object of the tabs modal.
 */
export const TABS_MODAL = {
    defaultHeight: "80%",
    defaultWidth: "80%"
}

/**
 * Configuration object of the process modal.
 */
export const PROCESS_MODAL = {
    defaultHeight: "80%",
    defaultWidth: "80%"
}

/**
 * Configuration object of the modal with the information about the stacktrace error. 
 * 
 * This modal is opened when the user clicks the button of the snackbar in case of error while saving, updating or deleting an entity.
 */
export const STACK_TRACE_MODAL = {
    defaultHeight: "60%",
    defaultWidth: "60%"
}

/**
 * Configuration object of the snackbars displayed when there is a response from the backend while saving, updating or deleting an entity.
 */
export const SNACKBAR = {
    defaultErrorDuration: 6000,
    defaultSuccessDuration: 3000,
    defaultMessageDetailIcon: "🗿",
}

/**
 * Configuration object of the context menu displayed when right clicking a row.
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
 * Configuration object of the view finder.
 */
export const VIEW_FINDER = {
    defaultWidthPcntg: 60,
    defaultDebounceTime: 750
}

/**
 * Default debounce time for all the selectors of the application.
 */
export const DEFAULT_SELECTOR_DEBOUNCE_TIME = 750;

export const HQL_PROPERTY = "hqlProperty";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export enum LoginStatus {
    LOGIN,
    LOGOUT
} 