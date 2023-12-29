import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { OpenFormService } from '../services/open-form.service';
import { FetchRowsService } from '../services/fetch-rows.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  private previousFetchLastId: string = "";
  private currentFetchFirstId: string = "";
  public currentFetchSize: number = 50;

  constructor(private openForm: OpenFormService, private fetchRows: FetchRowsService) { }

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

  openNewRowModal():void {
    this.openForm.sendRowChange(undefined);
  }

}

export enum PaginationEventType {
  RELOAD,
  FETCH_NEXT,
  FETCH_BACK
}
