import { KeyValue } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ViewComponent } from '../view/view.component';
import { DialogData, RowFormComponent } from '../row-form/row-form.component';
import { MatDialog } from '@angular/material/dialog';
import { OpenContextMenuService } from '../services/open-context-menu.service';
import { ContextMenuData } from '../context-menu/context-menu.component';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.css']
})
export class RowComponent {

  // Boolean to indicate if this row is being selected
  public selected: boolean = false;

  // Reference to the last row component selected to apply styles correctly
  private static lastRowSelected: RowComponent | undefined = undefined;

  // Row object
  @Input() row: any;

  // View component
  @Input() viewComponent!: ViewComponent;

  constructor(
    private dialog: MatDialog,
    private contextMenuService: OpenContextMenuService
  ) { }

  openRowInFormMode(row: any): void {
    this.updateLastSelectedRow();
    const dialogData: DialogData = {
      viewComponent: this.viewComponent,
      currentRow: row,
    }
    this.dialog.open(RowFormComponent, {
      data: dialogData,
      height: "80%",
      width: "80%"
    });
  }

  openContextMenu(event: MouseEvent, row: any): void {
    event.preventDefault();
    this.updateLastSelectedRow();
    const data: ContextMenuData = {
      top: event.clientY,
      left: event.clientX + 12, //12 px offset
      rowClicked: row,
      items: this.viewComponent.contextMenuItems // Items already initialized in the view
    }
    this.contextMenuService.createContextMenu(data);
  }

  /**
   * Function to properly manage styles and variables when left or right clicking in a row
   */
  updateLastSelectedRow(): void {
    if (RowComponent.lastRowSelected) {
      RowComponent.lastRowSelected.selected = false;
    }
    this.selected = true;
    RowComponent.lastRowSelected = this;
  }

  // Return an object with styles for the row
  getStyles(): any {
    return this.selected ? { "background-color": "#5698fb", "border": 0 } : undefined;
  }

  // Pipe to sort keys of the rows
  sortKeys = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    const firstElement = this.viewComponent.currentGridFieldsIndexedByHqlProperty[a.key];
    if (!firstElement) {
      return 1;
    }
    return firstElement.index > this.viewComponent.currentGridFieldsIndexedByHqlProperty[b.key]?.index ? 1 : -1;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
