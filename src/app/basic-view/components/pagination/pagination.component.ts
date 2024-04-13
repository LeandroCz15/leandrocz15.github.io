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
  public lastId: string = "";
  public firstId: string = "";
  public currentFetchSize: number = 50;
  private changePageSubscription!: Subscription;

  /********************** INPUTS **********************/
  @Input() tabData!: TabData;

  /********************** SUBJECTS  **********************/
  @Input() doFetchSubject!: Subject<PaginationEventType>;

  constructor(public dialog: MatDialog, private pageChangeService: SelectPageService) { }

  ngOnInit(): void {
    this.changePageSubscription = this.pageChangeService.getPageChangeObservable().subscribe(() => {
      this.lastId = "";
      this.firstId = "";
    });
  }

  ngOnDestroy(): void {
    this.changePageSubscription.unsubscribe();
  }

  fetchNextPage(): void {
    this.doFetchSubject.next(PaginationEventType.FETCH_NEXT);
  }

  fetchPreviousPage(): void {
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
    this.dialog.open(RowFormComponent, {
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
