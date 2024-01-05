import { Component, Input } from '@angular/core';
import { FetchRowsService } from '../services/fetch-rows.service';
import { DialogData, RowFormComponent } from '../row-form/row-form.component';
import { ViewComponent } from '../view/view.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  private previousFetchLastId: string = "";
  private currentFetchFirstId: string = "";
  public currentFetchSize: number = 50;

  @Input() viewComponent!: ViewComponent;

  constructor(private fetchRows: FetchRowsService, public dialog: MatDialog) { }

  getPreviousFetchLastId(): string {
    return this.previousFetchLastId;
  }

  setPreviousFetchLastId(previousFetchLastId: string): void {
    this.previousFetchLastId = previousFetchLastId;
  }

  getCurrentFetchFirstId(): string {
    return this.currentFetchFirstId;
  }

  setCurrentFetchFirstId(currentFetchFirstId: string): void {
    this.currentFetchFirstId = currentFetchFirstId
  }

  fetchNextPage(): void {
    this.fetchRows.sendFetchChange(PaginationEventType.FETCH_NEXT);
  }

  fetchPreviousPage(): void {
    this.fetchRows.sendFetchChange(PaginationEventType.FETCH_BACK);
  }

  changeFetchSize(newfetchSize: number): void {
    if (this.currentFetchSize !== newfetchSize) {
      this.currentFetchSize = newfetchSize;
      this.fetchRows.sendFetchChange(PaginationEventType.RELOAD);
    }
  }

  openNewRowModal(): void {
    const dialogData: DialogData = {
      viewComponent: this.viewComponent,
      currentRow: undefined
    }
    const dialogRef = this.dialog.open(RowFormComponent, {
      data: dialogData,
    });
    //this.openForm.sendRowChange(undefined);
  }

}

export enum PaginationEventType {
  RELOAD,
  FETCH_NEXT,
  FETCH_BACK
}
