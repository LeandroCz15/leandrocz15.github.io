import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FetchRowsService } from '../services/fetch-rows.service';
import { DialogData, RowFormComponent } from '../row-form/row-form.component';
import { ViewComponent } from '../view/view.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectPageService } from '../services/select-page.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnDestroy {

  private previousFetchFirstId: string = "";

  private currentFetchLastId: string = "";

  private currentFetchFirstId: string = "";

  private pageNumber: number = 1;

  private changePageSubscription!: Subscription;

  public currentFetchSize: number = 50;

  @Input() viewComponent!: ViewComponent;

  constructor(private fetchRows: FetchRowsService, public dialog: MatDialog, private pageChangeService: SelectPageService) { }

  ngOnInit(): void {
    this.changePageSubscription = this.pageChangeService.getPageChangeObservable().subscribe(() => {
      this.previousFetchFirstId = "";
      this.currentFetchLastId = "";
      this.currentFetchFirstId = "";
      this.pageNumber = 1;
    });
  }

  ngOnDestroy(): void {
    this.changePageSubscription.unsubscribe();
  }
  
  getPreviousFetchFirstId(): string {
    return this.previousFetchFirstId;
  }

  setPreviousFetchFirstId(previousFetchFirstId: string): void {
    this.previousFetchFirstId = previousFetchFirstId;
  }

  getCurrentFetchFirstId(): string {
    return this.currentFetchFirstId;
  }

  setCurrentFetchFirstId(currentFetchFirstId: string): void {
    this.currentFetchFirstId = currentFetchFirstId;
  }

  getCurrentFetchLastId(): string {
    return this.currentFetchLastId;
  }

  setCurrentFetchLastId(currentFetchLastId: string): void {
    this.currentFetchLastId = currentFetchLastId;
  }

  fetchNextPage(): void {
    if (this.currentFetchLastId === "") {
      return;
    }
    this.pageNumber++;
    this.fetchRows.sendFetchChange(PaginationEventType.FETCH_NEXT);
  }

  fetchPreviousPage(): void {
    if (this.pageNumber == 1) {
      return;
    }
    this.pageNumber--;
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
      height: "80%",
      width: "80%"
    });
  }

}

export enum PaginationEventType {
  RELOAD,
  FETCH_NEXT,
  FETCH_BACK
}
