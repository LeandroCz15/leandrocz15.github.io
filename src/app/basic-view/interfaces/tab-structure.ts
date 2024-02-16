import { ContextMenuItem } from "../components/context-menu/context-menu.component";

export interface TabData {
    clickedRow: any
    tab: any
    gridFields: any[]
    formFields: any[]
    contextMenuItems: ContextMenuItem[]
}