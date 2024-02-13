import { ContextMenuItem } from "../components/context-menu/context-menu.component";

export interface TabData {
    tabId: string,
    tabEntityName: string,
    gridFields: any[],
    formFields: any[],
    contextMenuItems: ContextMenuItem[],
}