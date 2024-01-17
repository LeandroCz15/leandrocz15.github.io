import { KeyValue } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ViewComponent } from '../view/view.component';
import { DialogData, RowFormComponent } from '../row-form/row-form.component';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private dialog: MatDialog) { }

  openRowInFormMode(row: any): void {
    const dialogData: DialogData = {
      viewComponent: this.viewComponent,
      currentRow: row,
    }
    this.dialog.open(RowFormComponent, {
      data: dialogData,
      height: "80%",
      width: "80%"
    });
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
