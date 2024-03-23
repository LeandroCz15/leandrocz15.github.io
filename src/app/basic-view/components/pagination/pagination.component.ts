import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogData, RowFormComponent } from '../row-form/row-form.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectPageService } from '../../services/select-page.service';
import { Subject, Subscription } from 'rxjs';
import { TabData } from '../../interfaces/tab-structure';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  private previousFetchFirstId: string = "";
  private currentFetchLastId: string = "";
  private currentFetchFirstId: string = "";
  private pageNumber: number = 1;
  private changePageSubscription!: Subscription;
  public currentFetchSize: number = 50;

  /********************** INPUTS **********************/
  @Input() tabData!: TabData;

  /********************** SUBJECTS  **********************/
  @Input() doFetchSubject!: Subject<PaginationEventType>;

  constructor(public dialog: MatDialog, private pageChangeService: SelectPageService) { }

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
    this.doFetchSubject.next(PaginationEventType.FETCH_NEXT);
  }

  fetchPreviousPage(): void {
    if (this.pageNumber == 1) {
      return;
    }
    this.pageNumber--;
    this.doFetchSubject.next(PaginationEventType.FETCH_BACK);
  }

  changeFetchSize(newfetchSize: number): void {
    if (this.currentFetchSize !== newfetchSize) {
      this.currentFetchSize = newfetchSize;
      this.doFetchSubject.next(PaginationEventType.RELOAD);
    }
  }

  openNewRowModal(): void {
    const dialogData: DialogData = {
      currentRow: undefined,
      allRows: [],
      tabData: this.tabData
    }
    const dialogRef = this.dialog.open(RowFormComponent, {
      data: dialogData,
      height: "80%",
      width: "80%"
    });
  }

}

export enum PaginationEventType {
  RELOAD = 0,
  FETCH_NEXT = 1,
  FETCH_BACK = 2
}
